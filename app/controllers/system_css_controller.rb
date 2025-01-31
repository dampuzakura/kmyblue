# frozen_string_literal: true

class SystemCssController < ActionController::Base # rubocop:disable Rails/ApplicationController
  before_action :set_user_roles

  def show
    expires_in 3.minutes, public: true
    render content_type: 'text/css'
  end

  private

  def set_user_roles
    @user_roles = UserRole.providing_styles
  end
end
