import nodemailer from "nodemailer"

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }
  return transporter
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`Password reset link for ${email}: ${resetUrl}`)
    return // Skip sending email if not configured
  }

  const mailOptions = {
    from: `"RMSTU Bus System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request - RMSTU Bus System",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p>You have requested to reset your password for the RMSTU Bus System.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: 500;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't request this password reset, you can safely ignore this email.
          This link will expire in 1 hour.
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          RMSTU Bus Management System<br>
          This is an automated email, please do not reply.
        </p>
      </div>
    `,
  }

  try {
    const transporter = getTransporter()
    await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent to ${email}`)
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export async function sendWelcomeEmail(email: string, name: string, tempPassword: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log(`Welcome credentials for ${email}: ${tempPassword}`)
    return // Skip sending email if not configured
  }

  const mailOptions = {
    from: `"RMSTU Bus System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to RMSTU Bus System",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to RMSTU Bus System</h2>
        
        <p>Hello ${name},</p>
        
        <p>Your account has been created for the RMSTU Bus Management System. Here are your login credentials:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
        </div>
        
        <p style="color: #dc2626; font-weight: 500;">
          ⚠️ Important: Please change your password after your first login for security.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: 500;">
            Login to System
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          RMSTU Bus Management System<br>
          This is an automated email, please do not reply.
        </p>
      </div>
    `,
  }

  try {
    const transporter = getTransporter()
    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent to ${email}`)
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw error
  }
}
