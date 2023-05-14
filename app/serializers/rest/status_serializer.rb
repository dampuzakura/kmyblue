# frozen_string_literal: true

class REST::StatusSerializer < ActiveModel::Serializer
  include FormattingHelper

  attributes :id, :created_at, :in_reply_to_id, :in_reply_to_account_id,
             :sensitive, :spoiler_text, :visibility, :visibility_ex, :language,
             :uri, :url, :replies_count, :reblogs_count, :searchability, :markdown,
             :favourites_count, :emoji_reactions, :emoji_reactions_count, :reactions, :edited_at

  attribute :favourited, if: :current_user?
  attribute :reblogged, if: :current_user?
  attribute :muted, if: :current_user?
  attribute :bookmarked, if: :current_user?
  attribute :pinned, if: :pinnable?
  attribute :reactions, if: :reactions?
  has_many :filtered, serializer: REST::FilterResultSerializer, if: :current_user?

  attribute :content, unless: :source_requested?
  attribute :text, if: :source_requested?

  belongs_to :reblog, serializer: REST::StatusSerializer
  belongs_to :application, if: :show_application?
  belongs_to :account, serializer: REST::AccountSerializer

  has_many :ordered_media_attachments, key: :media_attachments, serializer: REST::MediaAttachmentSerializer
  has_many :ordered_mentions, key: :mentions
  has_many :tags
  has_many :emojis, serializer: REST::CustomEmojiSerializer

  has_one :preview_card, key: :card, serializer: REST::PreviewCardSerializer
  has_one :preloadable_poll, key: :poll, serializer: REST::PollSerializer

  def id
    object.id.to_s
  end

  def in_reply_to_id
    object.in_reply_to_id&.to_s
  end

  def in_reply_to_account_id
    object.in_reply_to_account_id&.to_s
  end

  def current_user?
    !current_user.nil?
  end

  def show_application?
    object.account.user_shows_application? || (current_user? && current_user.account_id == object.account_id)
  end

  def visibility
    # This visibility is masked behind "private"
    # to avoid API changes because there are no
    # UX differences
    if object.limited_visibility?
      'private'
    elsif object.public_unlisted_visibility?
      'public'
    else
      object.visibility
    end
  end

  def visibility_ex
    object.visibility
  end

  def searchability
    object.compute_searchability
  end

  def sensitive
    if current_user? && current_user.account_id == object.account_id
      object.sensitive
    else
      object.account.sensitized? || object.sensitive
    end
  end

  def uri
    ActivityPub::TagManager.instance.uri_for(object)
  end

  def content
    status_content_format(object)
  end

  def url
    ActivityPub::TagManager.instance.url_for(object)
  end

  def favourited
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].favourites_map[object.id] || false
    else
      current_user.account.favourited?(object)
    end
  end

  def emoji_reactions
    object.emoji_reactions_grouped_by_name(current_user&.account)
  end

  def reactions
    emoji_reactions.tap do |rs|
      rs.each do |emoji_reaction|
        emoji_reaction['name'] = emoji_reaction['domain'].present? ? "#{emoji_reaction['name']}@#{emoji_reaction['domain']}" : emoji_reaction['name']
        emoji_reaction.delete('account_ids')
        emoji_reaction.delete('me')
        emoji_reaction.delete('domain')
      end
    end
  end

  def reblogged
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].reblogs_map[object.id] || false
    else
      current_user.account.reblogged?(object)
    end
  end

  def muted
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].mutes_map[object.conversation_id] || false
    else
      current_user.account.muting_conversation?(object.conversation)
    end
  end

  def bookmarked
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].bookmarks_map[object.id] || false
    else
      current_user.account.bookmarked?(object)
    end
  end

  def pinned
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].pins_map[object.id] || false
    else
      current_user.account.pinned?(object)
    end
  end

  def filtered
    if instance_options && instance_options[:relationships]
      instance_options[:relationships].filters_map[object.id] || []
    else
      current_user.account.status_matches_filters(object)
    end
  end

  def pinnable?
    current_user? &&
      current_user.account_id == object.account_id &&
      !object.reblog? &&
      %w(public unlisted public_unlisted private).include?(object.visibility)
  end

  def reactions?
    current_user? && current_user.setting_emoji_reaction_streaming_notify_impl2
  end

  def source_requested?
    instance_options[:source_requested]
  end

  def ordered_mentions
    object.active_mentions.to_a.sort_by(&:id)
  end

  class ApplicationSerializer < ActiveModel::Serializer
    attributes :name, :website

    def website
      object.website.presence
    end
  end

  class MentionSerializer < ActiveModel::Serializer
    attributes :id, :username, :url, :acct

    def id
      object.account_id.to_s
    end

    def username
      object.account_username
    end

    def url
      ActivityPub::TagManager.instance.url_for(object.account)
    end

    def acct
      object.account.pretty_acct
    end
  end

  class TagSerializer < ActiveModel::Serializer
    include RoutingHelper

    attributes :name, :url

    def url
      tag_url(object)
    end
  end
end
