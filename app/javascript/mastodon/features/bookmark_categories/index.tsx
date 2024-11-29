import { useEffect, useMemo, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import AddIcon from '@/material-icons/400-24px/add.svg?react';
import BookmarkIcon from '@/material-icons/400-24px/bookmark-fill.svg?react';
import BookmarksIcon from '@/material-icons/400-24px/bookmarks.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import SquigglyArrow from '@/svg-icons/squiggly_arrow.svg?react';
import { fetchBookmarkCategories } from 'mastodon/actions/bookmark_categories';
import { openModal } from 'mastodon/actions/modal';
import Column from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import ScrollableList from 'mastodon/components/scrollable_list';
import DropdownMenuContainer from 'mastodon/containers/dropdown_menu_container';
import { getOrderedBookmarkCategories } from 'mastodon/selectors/bookmark_categories';
import { useAppSelector, useAppDispatch } from 'mastodon/store';

const messages = defineMessages({
  heading: {
    id: 'column.bookmark_categories',
    defaultMessage: 'BookmarkCategories',
  },
  create: {
    id: 'bookmark_categories.create_bookmark_category',
    defaultMessage: 'Create category',
  },
  edit: {
    id: 'bookmark_categories.edit',
    defaultMessage: 'Edit category',
  },
  delete: {
    id: 'bookmark_categories.delete',
    defaultMessage: 'Delete category',
  },
  more: { id: 'status.more', defaultMessage: 'More' },
});

const BookmarkCategoryItem: React.FC<{
  id: string;
  title: string;
}> = ({ id, title }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleDeleteClick = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'CONFIRM_DELETE_BOOKMARK_CATEGORY',
        modalProps: {
          bookmark_categoryId: id,
        },
      }),
    );
  }, [dispatch, id]);

  const menu = useMemo(
    () => [
      {
        text: intl.formatMessage(messages.edit),
        to: `/bookmark_categories/${id}/edit`,
      },
      { text: intl.formatMessage(messages.delete), action: handleDeleteClick },
    ],
    [intl, id, handleDeleteClick],
  );

  return (
    <div className='lists__item'>
      <Link to={`/bookmark_categories/${id}`} className='lists__item__title'>
        <Icon id='bookmark_category-ul' icon={BookmarkIcon} />
        <span>{title}</span>
      </Link>

      <DropdownMenuContainer
        scrollKey='bookmark_categories'
        items={menu}
        icons='ellipsis-h'
        iconComponent={MoreHorizIcon}
        direction='right'
        title={intl.formatMessage(messages.more)}
      />
    </div>
  );
};

const BookmarkCategories: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const bookmark_categories = useAppSelector((state) =>
    getOrderedBookmarkCategories(state),
  );

  useEffect(() => {
    dispatch(fetchBookmarkCategories());
  }, [dispatch]);

  const emptyMessage = (
    <>
      <span>
        <FormattedMessage
          id='bookmark_categories.no_bookmark_categories_yet'
          defaultMessage='No bookmark_categories yet.'
        />
        <br />
        <FormattedMessage
          id='bookmark_categories.create_a_bookmark_category_to_organize'
          defaultMessage='Create a new bookmark_category to organize your Home feed'
        />
      </span>

      <SquigglyArrow className='empty-column-indicator__arrow' />
    </>
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.heading)}
    >
      <ColumnHeader
        title={intl.formatMessage(messages.heading)}
        icon='bookmark_category-ul'
        iconComponent={BookmarkIcon}
        multiColumn={multiColumn}
        extraButton={
          <Link
            to='/bookmark_categories/new'
            className='column-header__button'
            title={intl.formatMessage(messages.create)}
            aria-label={intl.formatMessage(messages.create)}
          >
            <Icon id='plus' icon={AddIcon} />
          </Link>
        }
      />

      <ScrollableList
        scrollKey='bookmark_categories'
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        alwaysPrepend
        prepend={
          <div className='lists__item'>
            <Link to={'/bookmarks'} className='lists__item__title'>
              <Icon id='bookmarks' icon={BookmarksIcon} />
              <span>
                <FormattedMessage
                  id='bookmark_categories.all_bookmarks'
                  defaultMessage='All bookmarks'
                />
              </span>
            </Link>
          </div>
        }
      >
        {bookmark_categories.map((bookmark_category) => (
          <BookmarkCategoryItem
            key={bookmark_category.id}
            id={bookmark_category.id}
            title={bookmark_category.title}
          />
        ))}
      </ScrollableList>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default BookmarkCategories;
