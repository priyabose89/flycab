<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

 $routes->post('login','AuthController::login');
/*
$routes->get('api'=>['namespace'=>'App\Controllers\Api'],function($routes){
        $routes->post('register','AuthController::register');
        $routes->post('login','AuthController::login');

        $routes->group('', ['filter' => 'jwtAuth'], function($routes) {
        $routes->post('rides/estimate', 'RideController::estimateFare');
        $routes->post('rides', 'RideController::create');
        $routes->get('rides/(:num)', 'RideController::show/$1');
        $routes->get('rides', 'RideController::history');
        });
    }
);
*/