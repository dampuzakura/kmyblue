import {
  apiRequestPost,
  apiRequestPut,
  apiRequestGet,
  apiRequestDelete,
} from 'mastodon/api';
import type { ApiAccountJSON } from 'mastodon/api_types/accounts';
import type { ApiBookmarkCategoryJSON } from 'mastodon/api_types/bookmark_categories';

export const apiCreate = (bookmarkCategory: Partial<ApiBookmarkCategoryJSON>) =>
  apiRequestPost<ApiBookmarkCategoryJSON>(
    'v1/bookmark_categories',
    bookmarkCategory,
  );

export const apiUpdate = (bookmarkCategory: Partial<ApiBookmarkCategoryJSON>) =>
  apiRequestPut<ApiBookmarkCategoryJSON>(
    `v1/bookmark_categories/${bookmarkCategory.id}`,
    bookmarkCategory,
  );

export const apiGetAccounts = (bookmarkCategoryId: string) =>
  apiRequestGet<ApiAccountJSON[]>(
    `v1/bookmark_categories/${bookmarkCategoryId}/statuses`,
    {
      limit: 0,
    },
  );

export const apiGetAccountBookmarkCategories = (accountId: string) =>
  apiRequestGet<ApiBookmarkCategoryJSON[]>(
    `v1/statuses/${accountId}/bookmark_categories`,
  );

export const apiAddAccountToBookmarkCategory = (
  bookmarkCategoryId: string,
  accountId: string,
) =>
  apiRequestPost(`v1/bookmark_categories/${bookmarkCategoryId}/statuses`, {
    account_ids: [accountId],
  });

export const apiRemoveAccountFromBookmarkCategory = (
  bookmarkCategoryId: string,
  accountId: string,
) =>
  apiRequestDelete(`v1/bookmark_categories/${bookmarkCategoryId}/statuses`, {
    account_ids: [accountId],
  });
