<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateRideStatusLogTable extends Migration
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
            'ride_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'status' => [
                'type'       => 'VARCHAR',
                'constraint' => '20',
                'null'       => false,
            ],
            'changed_at' => [
                'type'    => 'DATETIME',
                'null' => true,
            ],
        ]);

        // Set primary key
        $this->forge->addKey('id', true);

        // Set foreign key constraint
        $this->forge->addForeignKey('ride_id', 'rides', 'id', 'CASCADE', 'CASCADE');

        // Create table
        $this->forge->createTable('ride_status_log');
    }

    public function down()
    {
        // Drop foreign key first
        $this->forge->dropForeignKey('ride_status_log', 'ride_status_log_ride_id_foreign');
        
        // Drop table
        $this->forge->dropTable('ride_status_log');
    }
}
