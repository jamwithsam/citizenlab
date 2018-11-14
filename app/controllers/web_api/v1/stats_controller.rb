class WebApi::V1::StatsController < ApplicationController

  before_action :do_authorize, :parse_time_boundaries

  @@stats_service = StatsService.new

  # *** votes ***

  def votes_count
    count = votes_by_resource
      .where(created_at: @start_at..@end_at)
      .group(:mode)
      .count
    render json: { 
      up: count["up"], 
      down: count["down"], 
      count: (count["up"] || 0) + (count["down"] || 0)
    }
  end

  def votes_by_birthyear
    render json: votes_by_custom_field_key('birthyear', params, params[:normalization] || 'absolute')
  end

  def votes_by_domicile
    render json: votes_by_custom_field_key('domicile', params, params[:normalization] || 'absolute')
  end

  def votes_by_education
    render json: votes_by_custom_field_key('education', params, params[:normalization] || 'absolute')
  end

  def votes_by_gender
    render json: votes_by_custom_field_key('gender', params, params[:normalization] || 'absolute')
  end

  def votes_by_custom_field
    custom_field = CustomField.find params[:custom_field]
    render json: votes_by_custom_field_key(custom_field.key, params, params[:normalization] || 'absolute')
  end

  def votes_by_time
    if @no_data
      render json: {up:{}, down: {}, total: {}}
      return
    end

    serie = @@stats_service.group_by_time(
      votes_by_resource.group(:mode),
      'created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: double_grouped_by_to_nested_hashes(serie)
  end

  def votes_by_time_cumulative
    if @no_data
      render json: {up:{}, down: {}, total: {}}
      return
    end

    serie = @@stats_service.group_by_time_cumulative(
      votes_by_resource.group(:mode),
      'created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: double_grouped_by_to_nested_hashes(serie)
  end

  def votes_by_topic
    votes = Vote
      .where(votable_type: 'Idea')
      .joins("JOIN ideas ON ideas.id = votes.votable_id")

    if params[:project]
      votes = votes.where(ideas: {project_id: params[:project]})
    end

    if params[:group]
      group = Group.find(params[:group])
      votes = votes.where(user_id: group.members)
    end

    serie = votes
      .where(created_at: @start_at..@end_at)
      .joins("JOIN ideas_topics ON ideas_topics.idea_id = ideas.id")
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def votes_by_project
    votes = Vote
      .where(votable_type: 'Idea')
      .joins("JOIN ideas ON ideas.id = votes.votable_id")

    if params[:topic]
      votes = votes
        .joins("JOIN ideas_topics ON ideas.id = ideas_topics.idea_id")
        .where(ideas_topics: {topic_id: params[:topic]})
    end

    if params[:group]
      group = Group.find(params[:group])
      votes = votes.where(user_id: group.members)
    end
    serie = votes
      .where(created_at: @start_at..@end_at)
      .group("ideas.project_id")
      .order("ideas.project_id")
      .count
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, projects: projects.map{|p| [p.id, p.attributes.except('id')]}.to_h}
  end

  private

  # Some by_time queries will always return data with 0 values, so we need to
  # actively override them when we know there really is no data
  def render_no_data
    if @no_data
      render json: {}
    end
  end

  def range_intersection r1, r2
    ([r1.begin, r2.begin].max)..([r1.end, r2.end].min)
  end

  def parse_time_boundaries
    platform_range = Tenant.current.created_at..Time.now
    requested_range = (params[:start_at] || platform_range.begin)..(params[:end_at] || platform_range.end)
    if requested_range.overlaps?(platform_range)
      range = range_intersection(platform_range, requested_range)
      @start_at = range.begin
      @end_at = range.end
    else
      @no_data = true
      @start_at = Time.now
      @end_at = Time.now
    end
  end

  def votes_by_resource
    votes = Vote
    if ['Idea', 'Comment'].include? params[:resource]
      votes = votes.where(votable_type: params[:resource])
    end
    votes
  end

  def double_grouped_by_to_nested_hashes serie
    response = {
      "up" => {},
      "down" => {},
      "total" => Hash.new{|hash,key| hash[key] = 0}
    }
    serie.each_with_object(response) do |((mode, date), count), object|
      object[mode][date] = count
      object["total"][date] += count
    end
  end

  def apply_idea_filters ideas, filter_params
    ideas = ideas.where(id: filter_params[:ideas]) if filter_params[:ideas].present?
    ideas = ideas.with_some_topics(filter_params[:topics]) if filter_params[:topics].present?
    ideas = ideas.with_some_areas(filter_params[:areas]) if filter_params[:areas].present?
    ideas = ideas.in_phase(filter_params[:phase]) if filter_params[:phase].present?
    ideas = ideas.where(project_id: filter_params[:project]) if filter_params[:project].present?
    ideas = ideas.where(author_id: filter_params[:author]) if filter_params[:author].present?
    ideas = ideas.where(idea_status_id: filter_params[:idea_status]) if filter_params[:idea_status].present?
    ideas = ideas.search_by_all(filter_params[:search]) if filter_params[:search].present?
    if filter_params[:publication_status].present?
      ideas = ideas.where(publication_status: filter_params[:publication_status])
    else
      ideas = ideas.where(publication_status: 'published')
    end
    if (filter_params[:filter_trending] == 'true') && !filter_params[:search].present?
      ideas = trending_idea_service.filter_trending ideas
    end
    ideas
  end

  def votes_by_custom_field_key key, filter_params, normalization='absolute'
    serie = Vote
      .where(votable_type: 'Idea')
      .where(created_at: @start_at..@end_at)
      .where(votable_id: apply_idea_filters(policy_scope(Idea), filter_params))
      .left_outer_joins(:user)
      .group("mode","users.custom_field_values->>'#{key}'")
      .order("users.custom_field_values->>'#{key}'")
      .count
    data = %w(up down).map do |mode|
      [
        mode,
        serie.keys.select do |key_mode, _|
          key_mode == mode 
        end.map do |_, value|
          [(value || "_blank"), serie[[mode,value]]]
        end.to_h
      ]
    end.to_h
    data['total'] = (data['up'].keys+data['down'].keys).uniq.map do |key|
      [
        key,
        (data.dig('up',key) || 0) + (data.dig('down',key) || 0)
      ]
    end.to_h

    if normalization == 'relative'
      normalize_votes(data, key)
    else
      data
    end
  end

  def normalize_votes data, key
    normalizing_data = votes_by_custom_field_key(key, {}, 'absolute')
    data.map do |mode, buckets|
      [
        mode,
        buckets.map do |value, number|
          denominator = (normalizing_data.dig('total', value) || 0) + 1
          [value, number.to_f*100/denominator.to_f]
        end.to_h
      ]
    end.to_h
  end

  def secure_controller?
    false
  end

  def do_authorize
    authorize :stat
  end

end
