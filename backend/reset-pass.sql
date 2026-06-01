UPDATE users 
SET password = '$2b$10$a0PIVxx/tjBHoTIw4RafWeuos4daTK89OSFJzx9XTkpleKwF9vBX6' 
WHERE email = 'admin@lefer.com.br';

SELECT email, LEFT(password, 30) as pass_snippet FROM users WHERE email = 'admin@lefer.com.br';
