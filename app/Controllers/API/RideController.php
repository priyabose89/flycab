<?php

namespace App\Controllers\API;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class RideController extends ResourceController
{
    /**
     * Return an array of resource objects, themselves in array format.
     *
     * @return ResponseInterface
     */
    public function index()
    {
        //
    }

    /**
     * Return the properties of a resource object.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function show($id = null)
    {
        //
    }

    /**
     * Return a new resource object, with default properties.
     *
     * @return ResponseInterface
     */
    public function new()
    {
        //
    }

    /**
     * Create a new resource object, from "posted" parameters.
     *
     * @return ResponseInterface
     */
    public function create()
    {
        $data = $this->request->getJSON(true);

    $distance = $this->calculateDistance(
        $data['pickup_lat'], $data['pickup_lng'],
        $data['drop_lat'], $data['drop_lng']
    );
    $fare = $this->estimateFareAmount($distance, $data['vehicle_type']);

    $rideId = $this->rideModel->insert([
        'user_id'       => $this->request->userId,
        'pickup_address'=> $data['pickup_address'],
        'pickup_lat'    => $data['pickup_lat'],
        'pickup_lng'    => $data['pickup_lng'],
        'drop_address'  => $data['drop_address'],
        'drop_lat'      => $data['drop_lat'],
        'drop_lng'      => $data['drop_lng'],
        'vehicle_type'  => $data['vehicle_type'],
        'distance_km'   => $distance,
        'fare'          => $fare,
        'status'        => 'requested',
    ]);

    return $this->response->setJSON(['ride_id' => $rideId, 'fare' => $fare, 'status' => 'requested']);

    }

    /**
     * Return the editable properties of a resource object.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function edit($id = null)
    {
        //
    }

    /**
     * Add or update a model resource, from "posted" properties.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function update($id = null)
    {
        //
    }

    /**
     * Delete the designated resource object from the model.
     *
     * @param int|string|null $id
     *
     * @return ResponseInterface
     */
    public function delete($id = null)
    {
        //
    }

    private function estimateFareAmount($km, $type)
{
    $baseRates = ['mini' => 40, 'sedan' => 55, 'xl' => 75];
    $perKm     = ['mini' => 12, 'sedan' => 16, 'xl' => 22];
    return $baseRates[$type] + ($perKm[$type] * $km);
}
}
