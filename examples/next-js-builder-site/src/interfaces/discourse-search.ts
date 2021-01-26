export interface DiscourseResponse {
  posts?: PostsEntity[] | null;
  topics?: TopicsEntity[] | null;
  users?: null[] | null;
  categories?: CategoriesEntity[] | null;
  groups?: null[] | null;
  grouped_search_result: GroupedSearchResult;
}
export interface PostsEntity {
  id: number;
  name: string;
  username: string;
  avatar_template: string;
  created_at: string;
  like_count: number;
  blurb: string;
  post_number: number;
  topic_id: number;
}
export interface TopicsEntity {
  id: number;
  title: string;
  fancy_title: string;
  slug: string;
  posts_count: number;
  reply_count: number;
  highest_post_number: number;
  created_at: string;
  last_posted_at?: string | null;
  bumped: boolean;
  bumped_at: string;
  archetype: string;
  unseen: boolean;
  pinned: boolean;
  unpinned?: null;
  excerpt?: string | null;
  visible: boolean;
  closed: boolean;
  archived: boolean;
  bookmarked?: null;
  liked?: null;
  category_id: number;
  has_accepted_answer: boolean;
}
export interface CategoriesEntity {
  id: number;
  name: string;
  color: string;
  text_color: string;
  slug: string;
  topic_count: number;
  post_count: number;
  position: number;
  description: string;
  description_text: string;
  description_excerpt: string;
  topic_url: string;
  read_restricted: boolean;
  permission?: null;
  parent_category_id: number;
  notification_level?: null;
  topic_template?: null;
  has_children?: null;
  sort_order?: null;
  sort_ascending?: null;
  show_subcategory_list: boolean;
  num_featured_topics: number;
  default_view?: null;
  subcategory_list_style: string;
  default_top_period: string;
  default_list_filter: string;
  minimum_required_tags: number;
  navigate_to_first_post_after_read: boolean;
  uploaded_logo?: null;
  uploaded_background?: null;
}
export interface GroupedSearchResult {
  more_posts: boolean;
  more_users?: null;
  more_categories?: null;
  term: string;
  search_log_id: number;
  more_full_page_results?: null;
  can_create_topic: boolean;
  error?: null;
  post_ids?: number[] | null;
  user_ids?: null[] | null;
  category_ids?: number[] | null;
  group_ids?: null[] | null;
}
