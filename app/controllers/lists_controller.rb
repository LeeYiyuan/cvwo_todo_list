class ListsController < ApplicationController
  # Fetch list before doing anything else.
  before_action :retrieve_list, :only => [:delete_list, :get_items, :create_item, :get_item, :update_item, :delete_item]
  # Fetch item before doing anything else.
  before_action :retrieve_item, :only => [:update_item, :delete_item]
  
  # Creates a list and returns the key of the newly created list.
  def create_list
    key = SecureRandom.hex(8).upcase
    List.create(:key => key)
    render json: { key: key }
  end

  # Deletes a given list.
  def delete_list
    @list.destroy!
    render json: { }
  end

  # Retrieves the items in a given list and returns the retrieved items.
  def get_items
    render json: { items: @list.items }
  end

  # Creates an item in a given list and returns the created item.
  def create_item
    item = @list.items.create(:title => params[:title], :details => params[:details], :deadline => params[:deadline], :tags => params[:tags])
    render json: { item: item }
  end

  # Updates a given item.
  def update_item
    @item.title = params[:title]
    @item.deadline = params[:deadline]
    @item.details = params[:details]
    @item.tags = params[:tags]
    @item.save!
    render json: { }
  end

  # Deletes a given item.
  def delete_item
    @item.destroy!
    render json: { }
  end

  private

  def retrieve_list
    @list = List.where(key: params[:key]).first
    if (@list.nil?)
      render json: { error: "LIST_NOT_FOUND" }
    end
  end

  def retrieve_item
    @item = Item.where(id: params[:item_id]).first
    if (@list.nil?)
      render json: { error: "ITEM_NOT_FOUND" }
    end
    if (@item.list_id != @list.id) # Check if item ownership is correct.
      render json: { error: "UNAUTHORIZED_OWNER" }
    end
  end
end