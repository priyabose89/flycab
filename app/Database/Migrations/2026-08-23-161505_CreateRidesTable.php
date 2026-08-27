<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRidesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'driver_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => true,
            ],
            'pickup_address' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
                'null'       => false,
            ],
            'pickup_lat' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,7',
                'null'       => true,
            ],
            'pickup_lng' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,7',
                'null'       => true,
            ],
            'drop_address' => [
                'type'       => 'VARCHAR',
                'constraint' => '255',
                'null'       => false,
            ],
            'drop_lat' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,7',
                'null'       => true,
            ],
            'drop_lng' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,7',
                'null'       => true,
            ],
            'vehicle_type' => [
                'type'       => 'ENUM',
                'constraint' => ['mini', 'sedan', 'xl'],
                'null'       => false,
            ],
            'distance_km' => [
                'type'       => 'DECIMAL',
                'constraint' => '6,2',
                'null'       => true,
            ],
            'fare' => [
                'type'       => 'DECIMAL',
                'constraint' => '8,2',
                'null'       => true,
            ],
            'status' => [
                'type'       => 'ENUM',
                'constraint' => ['requested', 'accepted', 'ongoing', 'completed', 'cancelled'],
                'default'    => 'requested',
            ],
            'created_at' => [
                'type'    => 'DATETIME',
                'null' => true,
            ],
        ]);

        // Set primary key
        $this->forge->addKey('id', true);

        // Set foreign keys (Column, Referenced Table, Referenced Column, On Delete, On Update)
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('driver_id', 'drivers', 'id', 'SET NULL', 'CASCADE');

        // Create table
        $this->forge->createTable('rides');
    }

    public function down()
    {
        // Drop foreign keys first to prevent constraints conflict
        $this->forge->dropForeignKey('rides', 'rides_driver_id_foreign');
        $this->forge->dropForeignKey('rides', 'rides_user_id_foreign');
        
        $this->forge->dropTable('rides');
    }
}
