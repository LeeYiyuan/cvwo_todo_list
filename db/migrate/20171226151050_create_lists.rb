class CreateLists < ActiveRecord::Migration[5.1]
  def change
    create_table :lists do |t|
      t.string :key

      t.timestamps
    end
    add_index :lists, :key, unique: true
  end
end
