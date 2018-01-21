class CreateItems < ActiveRecord::Migration[5.1]
  def change
    create_table :items do |t|
      t.belongs_to :list, index: true
      t.string :title
      t.string :details
      t.datetime :deadline
      t.string :tags

      t.timestamps
    end
  end
end
