<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsersTable extends Migration
{
    public function up()
    {
        //define fields down 

        $this->forge->addField([
            'id'=>[
                'type' => 'INT',
                'constraint' =>11,
                'unsigned'  =>true,
                'auto_increment' =>true,
            ],
            'username'=>[
                 'type' => 'VARCHAR',
                 'constraint' =>'100',
             
            ],
            'email'=>[
                'type' => 'INT',
                'constraint' =>11,                 
                'unique'  =>true,

            ],

            'phone'=>[
                'type'=> 'VARCHAR',
                'constraint'=>20],

            'password_hash'=>[
                'type'=>'VARCHAR',
                'constraint'=>255, 
                'null'=>false
                ],
             'created_at' => [
                'type'    => 'TIMESTAMP',
                'null' => true,
            ],
        ]);
        //set primary key 
        $this->forge->addKey('id',true);

        //create the table named users        
        $this->forge->createTable('users');
    }

    public function down()
    {
        //Rollback strategy Drop the table if it exists 
        $this->forge->dropTable('users');
    }
}
