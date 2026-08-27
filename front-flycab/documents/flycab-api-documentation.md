# FlyCab API Documentation

A REST API for the FlyCab cab-booking app, built with **CodeIgniter 4** and **MySQL**, consumed by a separate **React** frontend.

---

## 1. Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Backend    | CodeIgniter 4 (API-only, JSON)       |
| Database   | MySQL                                |
| Auth       | JWT (`firebase/php-jwt`)             |
| Frontend   | React (separate app, calls this API) |

---

## 2. Project Structure

```
flycab-api/
  app/
    Controllers/
      Api/
        AuthController.php
        RideController.php
        DriverController.php
    Models/
      UserModel.php
      RideModel.php
      DriverModel.php
    Filters/
      JwtAuthFilter.php
    Config/
      Routes.php
      Filters.php
```

Install JWT support via Composer:

```bash
composer require firebase/php-jwt
```

Set your JWT secret in `.env` — never hardcode it:

```
JWT_SECRET=some-long-random-string-here
```

---

## 3. Database Schema (MySQL)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  vehicle_type ENUM('mini','sedan','xl') NOT NULL,
  vehicle_number VARCHAR(20),
  is_available TINYINT(1) DEFAULT 1
);

CREATE TABLE rides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  driver_id INT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  pickup_lat DECIMAL(10,7), pickup_lng DECIMAL(10,7),
  drop_address VARCHAR(255) NOT NULL,
  drop_lat DECIMAL(10,7), drop_lng DECIMAL(10,7),
  vehicle_type ENUM('mini','sedan','xl') NOT NULL,
  distance_km DECIMAL(6,2),
  fare DECIMAL(8,2),
  status ENUM('requested','accepted','ongoing','completed','cancelled') DEFAULT 'requested',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

CREATE TABLE ride_status_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ride_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(id)
);
```

---

## 4. Routes

`app/Config/Routes.php`

```php
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->post('register', 'AuthController::register');
    $routes->post('login', 'AuthController::login');

    $routes->group('', ['filter' => 'jwtAuth'], function($routes) {
        $routes->post('rides/estimate', 'RideController::estimateFare');
        $routes->post('rides', 'RideController::create');
        $routes->get('rides/(:num)', 'RideController::show/$1');
        $routes->get('rides', 'RideController::history');
    });
});
```

All routes under the second group require a valid JWT (see Section 6).

---

## 5. Endpoint Reference

### `POST /api/register`
Create a new user account and receive a token.

**Request body**
```json
{
  "name": "Priya",
  "email": "priya@example.com",
  "phone": "9876543210",
  "password": "secret123"
}
```

**Response `201`**
```json
{
  "user": { "id": 1, "name": "Priya", "email": "priya@example.com" },
  "token": "eyJhbGciOi..."
}
```

**Errors**
- `400` — missing name, email, or password
- `409` — email already registered

---

### `POST /api/login`
Authenticate an existing user.

**Request body**
```json
{
  "email": "priya@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "user": { "id": 1, "name": "Priya", "email": "priya@example.com" },
  "token": "eyJhbGciOi..."
}
```

**Errors**
- `400` — missing email or password
- `401` — invalid email or password

---

### `POST /api/rides` 🔒
Book a ride. Requires `Authorization: Bearer <token>`.

**Request body**
```json
{
  "pickup_address": "Anna Nagar, Chennai",
  "pickup_lat": 13.0850,
  "pickup_lng": 80.2101,
  "drop_address": "Chennai Central Station",
  "drop_lat": 13.0827,
  "drop_lng": 80.2707,
  "vehicle_type": "mini"
}
```

**Response `200`**
```json
{
  "ride_id": 42,
  "fare": 142.50,
  "status": "requested"
}
```

---

### `GET /api/rides/{id}` 🔒
Fetch a single ride's current status and details.

---

### `GET /api/rides` 🔒
Fetch the logged-in user's ride history.

---

### `POST /api/rides/estimate` 🔒
Return a fare estimate without creating a booking (same input shape as `POST /api/rides`, no `ride_id` created).

---

## 6. Authentication (JWT)

Every protected route requires this header:

```
Authorization: Bearer <token>
```

### `app/Filters/JwtAuthFilter.php`

```php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return service('response')->setStatusCode(401)->setJSON(['error' => 'Missing token']);
        }
        $token = substr($header, 7);
        try {
            $decoded = JWT::decode($token, new Key(getenv('JWT_SECRET'), 'HS256'));
            $request->userId = $decoded->sub; // stash for controller use
        } catch (\Exception $e) {
            return service('response')->setStatusCode(401)->setJSON(['error' => 'Invalid token']);
        }
    }
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
```

Register the filter alias in `app/Config/Filters.php`:

```php
public $aliases = [
    // ...existing aliases
    'jwtAuth' => \App\Filters\JwtAuthFilter::class,
];
```

Tokens expire after 24 hours (`exp` claim set on issue).

---

## 7. Controllers

### `app/Models/UserModel.php`

```php
<?php
namespace App\Models;
use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'email', 'phone', 'password_hash'];
    protected $returnType = 'array';
}
```

### `app/Controllers/Api/AuthController.php`

```php
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
            'sub'   => $userId,
            'email' => $email,
            'iat'   => time(),
            'exp'   => time() + (60 * 60 * 24), // 24 hours
        ];

        return JWT::encode($payload, getenv('JWT_SECRET'), 'HS256');
    }
}
```

### `app/Controllers/Api/RideController.php` (core methods)

```php
<?php
namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\RideModel;

class RideController extends BaseController
{
    protected $rideModel;

    public function __construct()
    {
        $this->rideModel = new RideModel();
    }

    public function create()
    {
        $data = $this->request->getJSON(true);

        $distance = $this->calculateDistance(
            $data['pickup_lat'], $data['pickup_lng'],
            $data['drop_lat'], $data['drop_lng']
        );
        $fare = $this->estimateFareAmount($distance, $data['vehicle_type']);

        $rideId = $this->rideModel->insert([
            'user_id'        => $this->request->userId,
            'pickup_address' => $data['pickup_address'],
            'pickup_lat'     => $data['pickup_lat'],
            'pickup_lng'     => $data['pickup_lng'],
            'drop_address'   => $data['drop_address'],
            'drop_lat'       => $data['drop_lat'],
            'drop_lng'       => $data['drop_lng'],
            'vehicle_type'   => $data['vehicle_type'],
            'distance_km'    => $distance,
            'fare'           => $fare,
            'status'         => 'requested',
        ]);

        return $this->response->setJSON(['ride_id' => $rideId, 'fare' => $fare, 'status' => 'requested']);
    }

    public function show($id)
    {
        $ride = $this->rideModel->where('id', $id)
                                 ->where('user_id', $this->request->userId)
                                 ->first();
        if (!$ride) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Ride not found']);
        }
        return $this->response->setJSON($ride);
    }

    public function history()
    {
        $rides = $this->rideModel->where('user_id', $this->request->userId)
                                  ->orderBy('created_at', 'DESC')
                                  ->findAll();
        return $this->response->setJSON($rides);
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        // Haversine formula — straight-line distance in km
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 2);
    }

    private function estimateFareAmount($km, $type)
    {
        $baseRates = ['mini' => 40, 'sedan' => 55, 'xl' => 75];
        $perKm     = ['mini' => 12, 'sedan' => 16, 'xl' => 22];
        return $baseRates[$type] + ($perKm[$type] * $km);
    }
}
```

> **Note:** The Haversine formula gives straight-line ("as the crow flies") distance, not actual road distance. It's fine for an MVP demo — swap in a real routing API (e.g. Google Distance Matrix) later for accurate fares.

---

## 8. Testing the API with curl

```bash
# Register
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya","email":"priya@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@example.com","password":"secret123"}'

# Book a ride (replace <token> with the value returned above)
curl -X POST http://localhost:8080/api/rides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "pickup_address": "Anna Nagar, Chennai",
    "pickup_lat": 13.0850, "pickup_lng": 80.2101,
    "drop_address": "Chennai Central Station",
    "drop_lat": 13.0827, "drop_lng": 80.2707,
    "vehicle_type": "mini"
  }'
```

---

## 9. React Integration Notes

The React frontend (`flycab-web/`) is a separate app that consumes this API over Axios.

`src/api/axios.js`:
```js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flycab_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

Remember to enable CORS in `app/Config/Filters.php` on the CI4 side so requests from React's dev server (different port) are accepted.

---

## 10. Roadmap (Not Yet Built)

- Driver assignment logic (currently manual/dummy)
- Real-time ride status updates (polling for MVP; websockets later)
- Payment integration
- Ratings and reviews
- Password reset flow
