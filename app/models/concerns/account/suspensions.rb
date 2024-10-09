# frozen_string_literal: true

module Account::Suspensions
  extend ActiveSupport::Concern

  included do
    scope :suspended, -> { where.not(suspended_at: nil) }
    scope :without_suspended, -> { where(suspended_at: nil) }
    scope :remote_pending, -> { where(remote_pending: true).where.not(suspended_at: nil) }
  end

  def suspended?
    suspended_at.present? && !instance_actor?
  end
  alias unavailable? suspended?

  def suspended_locally?
    suspended? && suspension_origin_local?
  end

  def suspended_permanently?
    suspended? && deletion_request.nil?
  end
  alias permanently_unavailable? suspended_permanently?

  def suspended_temporarily?
    suspended? && deletion_request.present?
  end

  def suspend!(date: Time.now.utc, origin: :local, block_email: true)
    transaction do
      create_deletion_request!
      update!(suspended_at: date, suspension_origin: origin)
      create_canonical_email_block! if block_email
    end
  end

  def unsuspend!
    transaction do
      deletion_request&.destroy!
      update!(suspended_at: nil, suspension_origin: nil)
      destroy_canonical_email_block!
    end
  end

  def approve_remote!
    return unless remote_pending

    update!(remote_pending: false)
    unsuspend!
    ActivateRemoteAccountWorker.perform_async(id)
  end

  def reject_remote!
    return unless remote_pending

    update!(remote_pending: false, suspension_origin: :local)
    pending_follow_requests.destroy_all
    pending_statuses.destroy_all
    suspend!
  end
end
