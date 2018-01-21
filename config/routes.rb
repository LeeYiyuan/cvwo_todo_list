Rails.application.routes.draw do
  post 'api/lists/', to: 'lists#create_list' 
  delete 'api/lists/:key', to: 'lists#delete_list'

  get 'api/lists/:key/items', to: 'lists#get_items'
  post 'api/lists/:key/items', to: 'lists#create_item'
  patch 'api/lists/:key/items/:item_id', to: 'lists#update_item'
  delete 'api/lists/:key/items/:item_id', to: 'lists#delete_item'
end
