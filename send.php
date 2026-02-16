<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
  $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
  $message = isset($_POST['message']) ? trim($_POST['message']) : '';

  $to = 'sbetiga@gmail.com';
  $subject = "Message de " . ($name ?: 'Visiteur');
  $body = "Nom: $name\nEmail: $email\n\nMessage:\n$message\n";

  $uploadDir = __DIR__ . '/uploads/';
  if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

  $allowedExt = array('dxf','pdf','sgp');
  $attachmentPath = '';

  if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $tmp = $_FILES['attachment']['tmp_name'];
    $origName = basename($_FILES['attachment']['name']);
    $size = $_FILES['attachment']['size'];
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExt)) {
      http_response_code(400);
      echo 'Extension non autorisée. Formats acceptés: .dxf, .sgp, .pdf';
      exit;
    }

    if ($size > 20 * 1024 * 1024) {
      http_response_code(400);
      echo 'Fichier trop volumineux (max 20MB).';
      exit;
    }

    $safeName = uniqid('f_', true) . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $origName);
    $dest = $uploadDir . $safeName;
    if (!move_uploaded_file($tmp, $dest)) {
      http_response_code(500);
      echo 'Erreur lors de l\'enregistrement du fichier.';
      exit;
    }
    $attachmentPath = $dest;
    $body .= "\nFichier joint: $safeName\n";
  }

  // Envoi du mail (avec pièce jointe si présente)
  $headers = "From: " . ($email ?: 'noreply@betiga.bj') . "\r\n";

  if ($attachmentPath) {
    $fileData = chunk_split(base64_encode(file_get_contents($attachmentPath)));
    $filename = basename($attachmentPath);
    $boundary = md5(time());
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n";

    $messageBody = "--$boundary\r\n";
    $messageBody .= "Content-Type: text/plain; charset=utf-8\r\n";
    $messageBody .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $messageBody .= $body . "\r\n";

    $messageBody .= "--$boundary\r\n";
    $messageBody .= "Content-Type: application/octet-stream; name=\"" . $filename . "\"\r\n";
    $messageBody .= "Content-Transfer-Encoding: base64\r\n";
    $messageBody .= "Content-Disposition: attachment; filename=\"" . $filename . "\"\r\n\r\n";
    $messageBody .= $fileData . "\r\n";
    $messageBody .= "--$boundary--";

    $sent = @mail($to, $subject, $messageBody, $headers);
  } else {
    $headers .= "Content-Type: text/plain; charset=utf-8\r\n";
    $sent = @mail($to, $subject, $body, $headers);
  }

  if ($sent) {
    echo 'OK: Message envoyé.';
  } else {
    http_response_code(500);
    echo 'Erreur lors de l\'envoi du message.';
  }
} else {
  http_response_code(405);
  echo 'Méthode non autorisée.';
}
?>
