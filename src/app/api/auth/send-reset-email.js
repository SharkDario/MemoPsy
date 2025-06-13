// pages/api/auth/send-reset-email.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, resetUrl } = req.body;

  // Validar que los datos requeridos estén presentes
  if (!email || !resetUrl) {
    return res.status(400).json({ message: 'Email y resetUrl son requeridos' });
  }

  const apiKey = process.env.BREVO_API_KEY;

  // Verificar que la API key esté configurada
  if (!apiKey) {
    console.error('BREVO_API_KEY no está configurada');
    return res.status(500).json({ message: 'Configuración del servidor incompleta' });
  }

  try {
    console.log('Enviando email a:', email); // Para debug

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: "MemoPsy", 
          email: "mdarioc1998@gmail.com" // ← Usa tu email personal para probar
        },
        to: [{ email }],
        subject: "Recuperación de contraseña - MemoPsy",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Recuperación de contraseña</h2>
            <p>Hola,</p>
            <p>Has solicitado recuperar tu contraseña para tu cuenta de <strong>MemoPsy</strong>.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p><small>O copia y pega este enlace en tu navegador:</small></p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
            <p style="color: #d9534f;"><em>Este enlace es válido por 1 hora solamente.</em></p>
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Si no solicitaste este cambio, puedes ignorar este correo.<br/>
              Saludos,<br/>El equipo de MemoPsy
            </p>
          </div>
        `
      })
    });

    // Obtener la respuesta como JSON para mejor debug
    const responseData = await response.json();

    if (!response.ok) {
      console.error("Error de Brevo:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      // Mensaje más específico según el error
      if (response.status === 401) {
        return res.status(500).json({ message: 'Error de autenticación con el servicio de email' });
      } else if (response.status === 400) {
        return res.status(500).json({ message: 'Error en los datos del email' });
      } else {
        return res.status(500).json({ message: 'Error al enviar el correo' });
      }
    }

    console.log('Email enviado exitosamente:', responseData);
    return res.status(200).json({ message: 'Correo enviado correctamente' });

  } catch (err) {
    console.error("Error completo al enviar con Brevo:", {
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}