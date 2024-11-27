import { useEffect, useState, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { useParams, Link } from 'react-router-dom';

import DeleteIcon from '@/material-icons/400-24px/delete.svg?react';
import DomainIcon from '@/material-icons/400-24px/dns.svg?react';
//import EditIcon from '@/material-icons/400-24px/edit.svg?react';
//import HashtagIcon from '@/material-icons/400-24px/tag.svg?react';
//import KeywordIcon from '@/material-icons/400-24px/title.svg?react';
import AntennaIcon from '@/material-icons/400-24px/wifi.svg?react';
import {
  fetchAntenna,
  fetchAntennaAccounts,
  fetchAntennaDomains,
  fetchAntennaExcludeAccounts,
  fetchAntennaKeywords,
  fetchAntennaTags,
} from 'mastodon/actions/antennas';
import {
  apiAddDomain,
  apiGetAccounts,
  apiRemoveDomain,
} from 'mastodon/api/antennas';
import { Button } from 'mastodon/components/button';
import Column from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import type { IconProp , Icon } from 'mastodon/components/icon';
import { IconButton } from 'mastodon/components/icon_button';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  deleteMessage: {
    id: 'confirmations.delete_antenna.message',
    defaultMessage: 'Are you sure you want to permanently delete this antenna?',
  },
  deleteConfirm: {
    id: 'confirmations.delete_antenna.confirm',
    defaultMessage: 'Delete',
  },
  editAccounts: {
    id: 'antennas.edit_accounts',
    defaultMessage: 'Edit accounts',
  },
  noOptions: {
    id: 'antennas.select.no_options_message',
    defaultMessage: 'Empty lists',
  },
  placeholder: {
    id: 'antennas.select.placeholder',
    defaultMessage: 'Select list',
  },
  addDomainLabel: {
    id: 'antennas.add_domain_placeholder',
    defaultMessage: 'New domain',
  },
  addKeywordLabel: {
    id: 'antennas.add_keyword_placeholder',
    defaultMessage: 'New keyword',
  },
  addTagLabel: {
    id: 'antennas.add_tag_placeholder',
    defaultMessage: 'New tag',
  },
  addDomainTitle: { id: 'antennas.add_domain', defaultMessage: 'Add domain' },
  addKeywordTitle: {
    id: 'antennas.add_keyword',
    defaultMessage: 'Add keyword',
  },
  addTagTitle: { id: 'antennas.add_tag', defaultMessage: 'Add tag' },
  accounts: { id: 'antennas.accounts', defaultMessage: '{count} accounts' },
  domains: { id: 'antennas.domains', defaultMessage: '{count} domains' },
  tags: { id: 'antennas.tags', defaultMessage: '{count} tags' },
  keywords: { id: 'antennas.keywords', defaultMessage: '{count} keywords' },
  setHome: { id: 'antennas.select.set_home', defaultMessage: 'Set home' },
});

const TextListItem: React.FC<{
  icon: string;
  iconComponent: IconProp;
  value: string;
  onRemove: (value: string) => void;
}> = ({ icon, iconComponent, value, onRemove }) => {
  const handleRemove = useCallback(() => { onRemove(value); }, [onRemove, value]);

  return (
    <div className='setting-text-list-item'>
      <Icon id={icon} icon={iconComponent} />
      <span className='label'>{value}</span>
      <IconButton
        title='Delete'
        icon='trash'
        iconComponent={DeleteIcon}
        onClick={handleRemove}
      />
    </div>
  );
};

const TextList: React.FC<{
  values: string[];
  disabled?: boolean;
  icon: string;
  iconComponent: IconProp;
  label: string;
  title: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}> = ({
  values,
  disabled,
  icon,
  iconComponent,
  label,
  title,
  onAdd,
  onRemove,
}) => {
  const [value, setValue] = useState('');

  const handleValueChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setValue(value);
    },
    [setValue],
  );

  const handleAdd = useCallback(() => {
    onAdd(value);
    setValue('');
  }, [onAdd, value]);

  const handleRemove = useCallback(
    (removeValue: string) => { onRemove(removeValue); },
    [onRemove],
  );

  const handleSubmit = handleAdd;

  return (
    <div className='setting-text-list'>
      {values.map((val) => (
        <TextListItem
          key={val}
          value={val}
          icon={icon}
          iconComponent={iconComponent}
          onRemove={handleRemove}
        />
      ))}

      <form className='add-text-form' onSubmit={handleSubmit}>
        <label>
          <span style={{ display: 'none' }}>{label}</span>

          <input
            className='setting-text'
            value={value}
            disabled={disabled}
            onChange={handleValueChange}
            placeholder={label}
          />
        </label>

        <Button
          disabled={disabled || !value}
          text={title}
          onClick={handleAdd}
        />
      </form>
    </div>
  );
};

const RadioPanel: React.FC<{
  items: { title: string; value: string }[];
  valueLengths: number[];
  alertMessage: React.ReactElement;
  onChange: (value: string) => void;
}> = ({ items, valueLengths, alertMessage, onChange }) => {
  const [error, setError] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (valueLengths.length >= 2) {
      setError(valueLengths.slice(1).some((v) => v > 0));
    } else {
      setError(false);
    }
  }, [valueLengths]);

  useEffect(() => {
    if (items.length > 0 && !items.some((i) => i.value === value)) {
      for (let i = 0; i < valueLengths.length; i++) {
        const length = valueLengths[i] ?? 0;
        const item = items[i] ?? { value: '' };
        if (length > 0) {
          setValue(item.value);
          return;
        }
      }
      setValue(items[0]?.value ?? '');
    }
  }, [items]);

  const handleChange = useCallback(
    ({ currentTarget }: React.MouseEvent<HTMLButtonElement>) => {
      const selected = currentTarget.getAttribute('data-value') ?? '';
      if (value !== selected) {
        onChange(selected);
        setValue(selected);
      }
    },
    [setValue],
  );

  return (
    <div>
      <div className='setting-radio-panel'>
        {items.map((item) => (
          <button
            className={classNames('setting-radio-panel__item', {
              'setting-radio-panel__item__active': value === item.value,
            })}
            key={item.value}
            onClick={handleChange}
            data-value={item.value}
          >
            {item.title}
          </button>
        ))}
      </div>

      {error && <div className='alert'>{alertMessage}</div>}
    </div>
  );
};

const MembersLink: React.FC<{
  id: string;
  onCountFetched: (count: number) => void;
}> = ({ id, onCountFetched }) => {
  const [count, setCount] = useState(0);
  const [avatars, setAvatars] = useState<string[]>([]);

  useEffect(() => {
    void apiGetAccounts(id)
      .then((data) => {
        setCount(data.length);
        onCountFetched(data.length);
        setAvatars(data.slice(0, 3).map((a) => a.avatar));
        return '';
      })
      .catch(() => {
        // Nothing
      });
  }, [id, setCount, setAvatars]);

  return (
    <Link to={`/antennas/${id}/members`} className='app-form__link'>
      <div className='app-form__link__text'>
        <strong>
          <FormattedMessage
            id='antennas.antenna_accounts'
            defaultMessage='Antenna accounts'
          />
        </strong>
        <FormattedMessage
          id='antennas.antenna_accounts_count'
          defaultMessage='{count, plural, one {# member} other {# accounts}}'
          values={{ count }}
        />
      </div>

      <div className='avatar-pile'>
        {avatars.map((url) => (
          <img key={url} src={url} alt='' />
        ))}
      </div>
    </Link>
  );
};

const AntennaSetting: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id?: string }>();
  const intl = useIntl();
  //const history = useHistory();

  const antenna = useAppSelector((state) =>
    id ? state.antennas.get(id) : undefined,
  );
  const domains = useAppSelector((state) =>
    id ? state.antennas.getIn(['domains', id]) : undefined,
  ) as string[] | undefined;
  const [domainList, setDomainList] = useState([] as string[]);
  const [accountsCount, setAccountsCount] = useState(0);
  const [rangeMode, setRangeMode] = useState('accounts');

  useEffect(() => {
    if (id) {
      dispatch(fetchAntenna(id));
      dispatch(fetchAntennaKeywords(id));
      dispatch(fetchAntennaDomains(id));
      dispatch(fetchAntennaTags(id));
      dispatch(fetchAntennaAccounts(id));
      dispatch(fetchAntennaExcludeAccounts(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && antenna) {
      setDomainList(domains ?? []);
    }
  }, [id, antenna, domains, setDomainList]);

  const handleAccountsFetched = useCallback(
    (count: number) => {
      setAccountsCount(count);
    },
    [setAccountsCount],
  );

  const handleAddDomain = useCallback(
    (value: string) => {
      if (!id) return;

      void apiAddDomain(id, value).then(() => {
        setDomainList([...domainList, value]);
        return value;
      });
    },
    [id, domainList, setDomainList],
  );

  const handleRemoveDomain = useCallback(
    (value: string) => {
      if (!id) return;

      void apiRemoveDomain(id, value).then(() => {
        setDomainList(domainList.filter((v) => v !== value));
        return value;
      });
    },
    [id, domainList, setDomainList],
  );

  const handleRangeRadioChange = useCallback(
    (value: string) => {
      setRangeMode(value);
    },
    [id, antenna, setRangeMode],
  );

  if (!antenna || !id) return <div />;

  const rangeRadioItems = [
    {
      value: 'accounts',
      title: intl.formatMessage(messages.accounts, { count: accountsCount }),
    },
    {
      value: 'domains',
      title: intl.formatMessage(messages.domains, { count: domainList.length }),
    },
  ];
  const rangeRadioLengths = [0, domainList.length];

  return (
    <Column bindToDocument={!multiColumn} label={antenna.title}>
      <ColumnHeader
        title={antenna.title}
        icon='antenna-ul'
        iconComponent={AntennaIcon}
        multiColumn={multiColumn}
        showBackButton
      />

      <div className='scrollable antenna-setting'>
        <RadioPanel
          items={rangeRadioItems}
          valueLengths={rangeRadioLengths}
          alertMessage={
            <div className='alert'>
              <FormattedMessage
                id='antennas.warnings.range_radio'
                defaultMessage='Simultaneous account and domain designation is not recommended.'
              />
            </div>
          }
          onChange={handleRangeRadioChange}
        />
        {rangeMode === 'accounts' && (
          <MembersLink id={id} onCountFetched={handleAccountsFetched} />
        )}
        {rangeMode === 'domains' && (
          <TextList
            values={domainList}
            icon='sitemap'
            iconComponent={DomainIcon}
            label={intl.formatMessage(messages.addDomainLabel)}
            title={intl.formatMessage(messages.addDomainTitle)}
            onAdd={handleAddDomain}
            onRemove={handleRemoveDomain}
          />
        )}
      </div>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default AntennaSetting;
