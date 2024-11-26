// See app/serializers/rest/antenna_serializer.rb

import type { ApiListJSON } from './lists';

export interface ApiAntennaJSON {
  id: string;
  title: string;
  stl: boolean;
  ltl: boolean;
  insert_feeds: boolean;
  with_media_only: boolean;
  ignore_reblog: boolean;
  accounts_count: number;
  domains_count: number;
  tags_count: number;
  keywords_count: number;
  list: ApiListJSON | null;
  domains: string[] | undefined;
  exclude_domains: string[] | undefined;
  keywords: string[] | undefined;
  exclude_keywords: string[] | undefined;
  tags: string[] | undefined;
  exclude_tags: string[] | undefined;

  list_id: string | undefined;
}
