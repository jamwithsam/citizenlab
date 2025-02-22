import React, { ReactElement } from 'react';
import { adopt } from 'react-adopt';
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import ReactSelect, { OptionTypeBase } from 'react-select';
import selectStyles from 'components/UI/MultipleSelect/styles';
import { Spinner, Icon } from 'cl2-component-library';

import styled from 'styled-components';

interface DataProps {
  users: GetUsersChildProps;
}

interface Props {
  onChange: (id: string) => void;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id: string;
  inputId: string;
}

export const AvatarImage = styled.img`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  fill: #596b7a;
  padding: 15px;
  border-radius: 50%;
  background: white;
  margin-right: 0.5rem;
`;

const AvatarIcon = styled(Icon)`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  fill: #596b7a;
  margin-right: 0.5rem;
`;

const UserOption = styled.div`
  display: flex;
  align-items: center;
`;

const UserSelect = ({
  users,
  onChange,
  value,
  placeholder,
  disabled = false,
  className,
  id,
  inputId,
}: DataProps & Props): ReactElement => {
  const usersList = Array.isArray(users.usersList) ? users.usersList : [];

  const handleChange = (option: OptionTypeBase) => {
    onChange(option.id);
  };

  const handleInputChange = (searchTerm) => {
    users.onChangeSearchTerm(searchTerm);
  };

  const handleMenuScrollToBottom = () => {
    users.onLoadMore();
  };

  const filterByNameAndEmail = (option: OptionTypeBase, searchText: string) => {
    if (
      option.data.attributes.first_name
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      option.data.attributes.last_name
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      option.data.attributes.email
        .toLowerCase()
        .includes(searchText.toLowerCase())
    ) {
      return true;
    } else {
      return false;
    }
  };

  const selectedUser = usersList.find((user) => user.id === value);

  const Avatar = ({ userId }) => {
    const user = usersList.find((user) => user.id === userId);
    const avatarSrc =
      user?.attributes?.avatar?.medium || user?.attributes?.avatar?.small;
    return (
      <>
        {avatarSrc ? (
          <AvatarImage className="avatarImage" src={avatarSrc} alt="" />
        ) : (
          <AvatarIcon className="avatarIcon" name="user" />
        )}
      </>
    );
  };

  const getOptionLabel = (option: OptionTypeBase): any => (
    <UserOption>
      <Avatar userId={option.value} />
      {option.attributes.first_name} {option.attributes.last_name} (
      {option.attributes.email})
    </UserOption>
  );

  const getOptionId = (option: OptionTypeBase) => option.id;

  const LoadingIndicator = (props): any => (
    <Spinner ref={props.innerRef} {...props} />
  );

  const components = { LoadingIndicator };

  return (
    <ReactSelect
      id={id}
      inputId={inputId}
      className={className}
      isSearchable
      blurInputOnSelect
      backspaceRemovesValue={false}
      menuShouldScrollIntoView={false}
      isClearable={false}
      value={selectedUser}
      placeholder={placeholder as string}
      options={usersList}
      getOptionValue={getOptionId}
      getOptionLabel={getOptionLabel}
      onChange={handleChange}
      onInputChange={handleInputChange}
      isDisabled={disabled}
      menuPlacement="auto"
      styles={selectStyles}
      filterOption={filterByNameAndEmail}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      isLoading={users.isLoading}
      components={components}
    />
  );
};

const Data = adopt<DataProps>({
  users: <GetUsers />,
});

export default (props) => (
  <Data>{(dataProps) => <UserSelect {...dataProps} {...props} />}</Data>
);
