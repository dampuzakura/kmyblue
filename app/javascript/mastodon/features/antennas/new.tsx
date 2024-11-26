import { useCallback, useState, useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { useParams, useHistory, Link } from 'react-router-dom';

import { isFulfilled } from '@reduxjs/toolkit';

import Toggle from 'react-toggle';

import AntennaIcon from '@/material-icons/400-24px/wifi.svg?react';
import { fetchAntenna } from 'mastodon/actions/antennas';
import { createAntenna, updateAntenna } from 'mastodon/actions/antennas_typed';
import { fetchLists } from 'mastodon/actions/lists';
import Column from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  edit: { id: 'column.edit_antenna', defaultMessage: 'Edit antenna' },
  create: { id: 'column.create_antenna', defaultMessage: 'Create antenna' },
});

const FiltersLink: React.FC<{
  id: string;
}> = ({ id }) => {
  return (
    <Link to={`/antennasw/${id}`} className='app-form__link'>
      <div className='app-form__link__text'>
        <strong>
          <FormattedMessage
            id='antennas.filter_items'
            defaultMessage='Antenna filtering'
          />
        </strong>
      </div>
    </Link>
  );
};

const NewAntenna: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id?: string }>();
  const intl = useIntl();
  const history = useHistory();

  const antenna = useAppSelector((state) =>
    id ? state.antennas.get(id) : undefined,
  );
  const lists = useAppSelector((state) => state.lists);
  const [title, setTitle] = useState('');
  const [stl, setStl] = useState(false);
  const [ltl, setLtl] = useState(false);
  const [insertFeeds, setInsertFeeds] = useState(false);
  const [listId, setListId] = useState('');
  const [withMediaOnly, setWithMediaOnly] = useState(false);
  const [ignoreReblog, setIgnoreReblog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAntenna(id));
      dispatch(fetchLists());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && antenna) {
      setTitle(antenna.title);
      setStl(antenna.stl);
      setLtl(antenna.ltl);
      setInsertFeeds(antenna.insert_feeds);
      setListId(antenna.list?.id ?? '');
      setWithMediaOnly(antenna.with_media_only);
      setIgnoreReblog(antenna.ignore_reblog);
    }
  }, [
    setTitle,
    setStl,
    setLtl,
    setInsertFeeds,
    setListId,
    setWithMediaOnly,
    setIgnoreReblog,
    id,
    antenna,
    lists,
  ]);

  const handleTitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(value);
    },
    [setTitle],
  );

  /*
  const handleStlChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setStl(checked);
    },
    [setStl],
  );

  const handleLtlChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setLtl(checked);
    },
    [setLtl],
  );
  */

  const handleInsertFeedsChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setInsertFeeds(checked);
    },
    [setInsertFeeds],
  );

  const handleListIdChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) => {
      setListId(value);
    },
    [setListId],
  );

  /*
  const handleWithMediaOnlyChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setWithMediaOnly(checked);
    },
    [setWithMediaOnly],
  );

  const handleIgnoreReblogChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setIgnoreReblog(checked);
    },
    [setIgnoreReblog],
  );
  */

  const handleSubmit = useCallback(() => {
    setSubmitting(true);

    if (id) {
      void dispatch(
        updateAntenna({
          id,
          title,
          stl,
          ltl,
          insert_feeds: insertFeeds,
          list_id: listId,
          with_media_only: withMediaOnly,
          ignore_reblog: ignoreReblog,
        }),
      ).then(() => {
        setSubmitting(false);
        return '';
      });
    } else {
      void dispatch(
        createAntenna({
          title,
          stl,
          ltl,
          insert_feeds: insertFeeds,
          list_id: listId,
          with_media_only: withMediaOnly,
          ignore_reblog: ignoreReblog,
        }),
      ).then((result) => {
        setSubmitting(false);

        if (isFulfilled(result)) {
          history.replace(`/antennas/${result.payload.id}/edit`);
          history.push(`/antennas/${result.payload.id}/members`);
        }

        return '';
      });
    }
  }, [
    history,
    dispatch,
    setSubmitting,
    id,
    title,
    stl,
    ltl,
    insertFeeds,
    listId,
    withMediaOnly,
    ignoreReblog,
  ]);

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(id ? messages.edit : messages.create)}
    >
      <ColumnHeader
        title={intl.formatMessage(id ? messages.edit : messages.create)}
        icon='antenna-ul'
        iconComponent={AntennaIcon}
        multiColumn={multiColumn}
        showBackButton
      />

      <div className='scrollable'>
        <form className='simple_form app-form' onSubmit={handleSubmit}>
          <div className='fields-group'>
            <div className='input with_label'>
              <div className='label_input'>
                <label htmlFor='antenna_title'>
                  <FormattedMessage
                    id='antennas.antenna_name'
                    defaultMessage='Antenna name'
                  />
                </label>

                <div className='label_input__wrapper'>
                  <input
                    id='antenna_title'
                    type='text'
                    value={title}
                    onChange={handleTitleChange}
                    maxLength={30}
                    required
                    placeholder=' '
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='fields-group'>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className='app-form__toggle'>
              <div className='app-form__toggle__label'>
                <strong>
                  <FormattedMessage
                    id='antennas.insert_feeds'
                    defaultMessage='Insert to feeds'
                  />
                </strong>
                <span className='hint'>
                  <FormattedMessage
                    id='antennas.insert_feeds_hint'
                    defaultMessage='Insert to any timelines.'
                  />
                </span>
              </div>

              <div className='app-form__toggle__toggle'>
                <div>
                  <Toggle
                    checked={insertFeeds}
                    onChange={handleInsertFeedsChange}
                  />
                </div>
              </div>
            </label>
          </div>

          <div className='fields-group'>
            <div className='input with_label'>
              <div className='label_input'>
                <label htmlFor='antenna_list'>
                  <FormattedMessage
                    id='antennas.insert_list'
                    defaultMessage='List'
                  />
                </label>

                <div className='label_input__wrapper'>
                  <select
                    id='antenna_insert_list'
                    value={listId}
                    onChange={handleListIdChange}
                  >
                    <option value=''>Home</option>
                    {lists.forEach(
                      (list) =>
                        list !== null && (
                          <option key={list.id} value={list.id}>
                            {list.title}
                          </option>
                        ),
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {id && (
            <div className='fields-group'>
              <FiltersLink id={id} />
            </div>
          )}

          <div className='actions'>
            <button className='button' type='submit'>
              {submitting ? (
                <LoadingIndicator />
              ) : id ? (
                <FormattedMessage id='antennas.save' defaultMessage='Save' />
              ) : (
                <FormattedMessage
                  id='antennas.create'
                  defaultMessage='Create'
                />
              )}
            </button>
          </div>
        </form>
      </div>

      <Helmet>
        <title>
          {intl.formatMessage(id ? messages.edit : messages.create)}
        </title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default NewAntenna;
