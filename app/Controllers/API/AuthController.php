<?php
namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use Firebase\JWT\JWT;

class AuthController extends BaseController
{
    protected $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    public function register()
    {
        $data = $this->request->getJSON(true);

        // Basic validation
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Name, email, and password are required']);
        }

        $existing = $this->userModel->where('email', $data['email'])->first();
        if ($existing) {
            return $this->response->setStatusCode(409)->setJSON(['error' => 'Email already registered']);
        }

        $userId = $this->userModel->insert([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'phone'         => $data['phone'] ?? null,
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
        ]);

        $token = $this->generateToken($userId, $data['email']);

        return $this->response->setStatusCode(201)->setJSON([
            'user'  => ['id' => $userId, 'name' => $data['name'], 'email' => $data['email']],
            'token' => $token,
        ]);
    }

    public function login()
    {
        $data = $this->request->getJSON(true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Email and password are required']);
        }

        $user = $this->userModel->where('email', $data['email'])->first();

        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            return $this->response->setStatusCode(401)->setJSON(['error' => 'Invalid email or password']);
        }

        $token = $this->generateToken($user['id'], $user['email']);

        return $this->response->setJSON([
            'user'  => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']],
            'token' => $token,
        ]);
    }

    private function generateToken($userId, $email)
    {
        $payload = [
            'sub' => $userId,
            'email' => $email,
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24), // 24 hours
        ];

        return JWT::encode($payload, getenv('JWT_SECRET'), 'HS256');
    }
}