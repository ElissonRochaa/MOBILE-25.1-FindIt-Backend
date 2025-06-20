// src/routes/resetPasswordHtmlRoutes.ts

import { Router, Request, Response } from 'express';

const resetPasswordHtmlRouter = Router();

resetPasswordHtmlRouter.get('/', (req: Request, res: Response) => {
    const email = req.query.email || '';

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinir Senha - FindIt</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --primary-color: #6C63FF;
                    --primary-dark: #5A52D3;
                    --text-color: #2D3748;
                    --text-secondary: #718096;
                    --background: #F7FAFC;
                    --card-bg: #FFFFFF;
                    --error-color: #E53E3E;
                    --success-color: #38A169;
                }
                
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: var(--background);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    color: var(--text-color);
                }
                
                .container {
                    background-color: var(--card-bg);
                    padding: 40px;
                    border-radius: 24px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    width: 100%;
                    max-width: 450px;
                    text-align: center;
                }
                
                .logo {
                    width: 173px;
                    height: auto;
                    margin-bottom: 30px;
                }
                
                h1 {
                    font-size: 36px;
                    font-weight: 700;
                    margin-bottom: 24px;
                    text-align: center;
                    color: var(--text-color);
                }
                
                .email-display {
                    color: var(--text-secondary);
                    margin-bottom: 30px;
                    font-size: 16px;
                    text-align: center;
                    padding: 0 20px;
                }
                
                .input-container {
                    position: relative;
                    margin-bottom: 20px;
                    width: 100%;
                }
                
                .input-field {
                    width: 100%;
                    padding: 18px 25px 18px 60px;
                    font-size: 18px;
                    border-radius: 30px;
                    border: 1px solid #E2E8F0;
                    background-color: rgba(108, 99, 255, 0.05);
                    transition: all 0.3s;
                    outline: none;
                    box-sizing: border-box;
                }
                
                .input-field:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.2);
                }
                
                .input-icon {
                    position: absolute;
                    left: 25px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 24px;
                    height: 24px;
                    z-index: 2;
                }
                
                .gradient-btn {
                    background: linear-gradient(to right, var(--primary-color), var(--primary-dark));
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 30px;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 10px;
                    transition: transform 0.2s;
                }
                
                .gradient-btn:hover {
                    transform: translateY(-2px);
                }
                
                .message {
                    margin-top: 20px;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 500;
                    display: none;
                    text-align: center;
                }
                
                .error {
                    background-color: rgba(229, 62, 62, 0.1);
                    color: var(--error-color);
                    display: block;
                }
                
                .success {
                    background-color: rgba(56, 161, 105, 0.1);
                    color: var(--success-color);
                    display: block;
                }
                
                .footer {
                    margin-top: 30px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    text-align: center;
                    line-height: 1.6;
                }
                
                @media (max-width: 480px) {
                    .container {
                        padding: 30px 20px;
                        border-radius: 0;
                        min-height: 100vh;
                        box-shadow: none;
                    }
                    
                    h1 {
                        font-size: 28px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Redefinir Senha</h1>
                <p class="email-display">Para o email: <strong>${email}</strong></p>
                
                <form id="resetPasswordForm">
                    <input type="hidden" id="email" value="${email}">
                    
                    <div class="input-container">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#6C63FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#6C63FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <input type="password" id="password" class="input-field" placeholder="Nova Senha" required minlength="6">
                    </div>
                    
                    <div class="input-container">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#6C63FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#6C63FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <input type="password" id="confirmPassword" class="input-field" placeholder="Confirmar Nova Senha" required minlength="6">
                    </div>
                    
                    <button type="submit" class="gradient-btn">Redefinir Senha</button>
                    <div id="message" class="message"></div>
                </form>
                
             
            </div>

            <script>
                document.getElementById('resetPasswordForm').addEventListener('submit', async function(event) {
                    event.preventDefault();

                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    const messageDiv = document.getElementById('message');

                    messageDiv.textContent = '';
                    messageDiv.className = 'message';

                    if (password !== confirmPassword) {
                        messageDiv.textContent = 'As senhas não coincidem!';
                        messageDiv.classList.add('error');
                        return;
                    }
                    if (password.length < 6) {
                        messageDiv.textContent = 'A senha deve ter pelo menos 6 caracteres!';
                        messageDiv.classList.add('error');
                        return;
                    }

                    try {
                        const backendBaseUrl = window.location.origin;
                        const response = await fetch(backendBaseUrl + '/api/v1/users/reset-password', {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email: email, password: password })
                        });

                        const data = await response.json();

                        if (response.ok) {
                            messageDiv.textContent = data.message || 'Senha redefinida com sucesso!';
                            messageDiv.classList.add('success');
                            document.getElementById('resetPasswordForm').style.display = 'none';
                            
                            setTimeout(() => {
                                window.location.href = '/login';
                            }, 2000);
                        } else {
                            messageDiv.textContent = data.message || 'Erro ao redefinir a senha.';
                            messageDiv.classList.add('error');
                        }
                    } catch (error) {
                        console.error('Erro de rede:', error);
                        messageDiv.textContent = 'Não foi possível conectar ao servidor. Tente novamente.';
                        messageDiv.classList.add('error');
                    }
                });
            </script>
        </body>
        </html>
    `);
});

export default resetPasswordHtmlRouter;