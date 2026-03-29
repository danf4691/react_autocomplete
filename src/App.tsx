import React, { useCallback } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Autocomplete } from './autocomplete';
import { Person } from './types/Person';
import debounce from 'lodash.debounce';

function getSuggestions(people: Person[], query: string) {
  let preparedSuggestions;
  const trimmedQuery = query.toLowerCase();

  if (trimmedQuery) {
    preparedSuggestions = people.filter(person =>
      person.name.toLowerCase().startsWith(trimmedQuery),
    );
  }

  return preparedSuggestions !== undefined ? preparedSuggestions : people;
}

type AppProps = {
  debounceDelay?: number;
};

export const App: React.FC<AppProps> = ({ debounceDelay = 300 }) => {
  const [query, setQuery] = React.useState('');
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(
    null,
  );

  const trimmedQuery = query.trim();
  const suggestions =
    trimmedQuery !== '' || (isInputFocused && query === '')
      ? getSuggestions(peopleFromServer, query)
      : [];

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setQuery(person.name);
  };

  const applyQueryDebounce = useCallback(
    debounce((value: string) => {
      setQuery(value);
      setSelectedPerson(null);
    }, debounceDelay),
    [debounceDelay],
  );

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    applyQueryDebounce(event.target.value);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    applyQueryDebounce.flush();
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {!selectedPerson
            ? 'No selected person'
            : `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`}
        </h1>

        <div className="dropdown is-active">
          <div className="dropdown-trigger">
            <input
              value={query}
              onChange={handleQueryChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
            />
          </div>
          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              <Autocomplete
                people={suggestions}
                onSelect={handleSelectPerson}
                isFocused={isInputFocused}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
