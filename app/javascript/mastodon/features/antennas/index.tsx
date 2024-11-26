import { useEffect, useMemo, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import AddIcon from '@/material-icons/400-24px/add.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import AntennaIcon from '@/material-icons/400-24px/wifi.svg?react';
import SquigglyArrow from '@/svg-icons/squiggly_arrow.svg?react';
import { fetchAntennas } from 'mastodon/actions/antennas';
import { openModal } from 'mastodon/actions/modal';
import Column from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import ScrollableList from 'mastodon/components/scrollable_list';
import DropdownMenuContainer from 'mastodon/containers/dropdown_menu_container';
import { getOrderedAntennas } from 'mastodon/selectors/antennas';
import { useAppSelector, useAppDispatch } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'column.antennas', defaultMessage: 'Antennas' },
  create: { id: 'antennas.create_antenna', defaultMessage: 'Create antenna' },
  edit: { id: 'antennas.edit', defaultMessage: 'Edit antenna' },
  delete: { id: 'antennas.delete', defaultMessage: 'Delete antenna' },
  more: { id: 'status.more', defaultMessage: 'More' },
  insert_list: { id: 'antennas.insert_list', defaultMessage: 'List' },
  insert_home: { id: 'antennas.insert_home', defaultMessage: 'Home' },
});

const AntennaItem: React.FC<{
  id: string;
  title: string;
  insert_feeds: boolean;
  isList: boolean;
}> = ({ id, title, insert_feeds, isList }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleDeleteClick = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'CONFIRM_DELETE_LIST',
        modalProps: {
          antennaId: id,
        },
      }),
    );
  }, [dispatch, id]);

  const menu = useMemo(
    () => [
      { text: intl.formatMessage(messages.edit), to: `/antennas/${id}/edit` },
      { text: intl.formatMessage(messages.delete), action: handleDeleteClick },
    ],
    [intl, id, handleDeleteClick],
  );

  return (
    <div className='antennas__item'>
      <Link to={`/antennas/${id}`} className='antennas__item__title'>
        <Icon id='antenna-ul' icon={AntennaIcon} />
        <span>{title}</span>
        {insert_feeds
          ? intl.formatMessage(
              isList ? messages.insert_list : messages.insert_home,
            )
          : undefined}
      </Link>

      <DropdownMenuContainer
        scrollKey='antennas'
        items={menu}
        icons='ellipsis-h'
        iconComponent={MoreHorizIcon}
        direction='right'
        title={intl.formatMessage(messages.more)}
      />
    </div>
  );
};

const Antennas: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const antennas = useAppSelector((state) => getOrderedAntennas(state));

  useEffect(() => {
    dispatch(fetchAntennas());
  }, [dispatch]);

  const emptyMessage = (
    <>
      <span>
        <FormattedMessage
          id='antennas.no_antennas_yet'
          defaultMessage='No antennas yet.'
        />
        <br />
        <FormattedMessage
          id='antennas.create_a_antenna_to_organize'
          defaultMessage='Create a new antenna to organize your Home feed'
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
        icon='antenna-ul'
        iconComponent={AntennaIcon}
        multiColumn={multiColumn}
        extraButton={
          <Link
            to='/antennas/new'
            className='column-header__button'
            title={intl.formatMessage(messages.create)}
            aria-label={intl.formatMessage(messages.create)}
          >
            <Icon id='plus' icon={AddIcon} />
          </Link>
        }
      />

      <ScrollableList
        scrollKey='antennas'
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
      >
        {antennas.map((antenna) => (
          <AntennaItem
            key={antenna.id}
            id={antenna.id}
            title={antenna.title}
            insert_feeds={antenna.insert_feeds}
            isList={!!antenna.list}
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
export default Antennas;
