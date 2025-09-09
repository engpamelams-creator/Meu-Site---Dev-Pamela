<?php
// contato.php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Limpa e captura os campos
    $name    = trim($_POST['name'] ?? '');
    $email   = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    // Monta o texto completo (sem codificar ainda)
    $text = "Nome: {$name}\nEmail: {$email}\nAssunto: {$subject}\nMensagem: {$message}";

    // Codifica a query de forma segura (RFC 3986)
    $query = http_build_query(['text' => $text], '', '&', PHP_QUERY_RFC3986);

    // Número de destino no formato DDI+DDD+número (sem + ou espaços)
    $whatsappNumber = '5511945835660';

    // Redireciona para o WhatsApp
    header("Location: https://wa.me/{$whatsappNumber}?{$query}", true, 302);
    exit;
}

// Qualquer outra requisição cai aqui
header('Location: index.html', true, 302);
exit;
?>
