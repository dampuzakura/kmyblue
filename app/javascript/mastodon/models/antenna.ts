import type { RecordOf } from 'immutable';
import { Record } from 'immutable';

import type { ApiAntennaJSON } from 'mastodon/api_types/antennas';

type AntennaShape = Required<ApiAntennaJSON>; // no changes from server shape
export type Antenna = RecordOf<AntennaShape>;

const AntennaFactory = Record<AntennaShape>({
  id: '',
  title: '',
  stl: false,
  ltl: false,
  insert_feeds: false,
  with_media_only: false,
  ignore_reblog: false,
  accounts_count: 0,
  domains_count: 0,
  tags_count: 0,
  keywords_count: 0,
  list: null,
  domains: undefined,
  keywords: undefined,
  tags: undefined,
  exclude_domains: undefined,
  exclude_keywords: undefined,
  exclude_tags: undefined,
  list_id: undefined,
});

export function createAntenna(attributes: Partial<AntennaShape>) {
  return AntennaFactory(attributes);
}
