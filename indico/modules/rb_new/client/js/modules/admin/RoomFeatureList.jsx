/* This file is part of Indico.
 * Copyright (C) 2002 - 2018 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico; if not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Field} from 'react-final-form';
import {List, Icon} from 'semantic-ui-react';
import {ICONS_AND_ALIASES} from 'semantic-ui-react/dist/es/lib/SUI';
import {formatters, ReduxDropdownField, ReduxFormField} from 'indico/react/forms';
import {Param, Plural, PluralTranslate, Singular, Translate} from 'indico/react/i18n';
import * as adminActions from './actions';
import * as adminSelectors from './selectors';
import EditableList from './EditableList';

import './EditableList.module.scss';


class RoomFeatureList extends React.PureComponent {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        features: PropTypes.array.isRequired,
        actions: PropTypes.exact({
            deleteFeature: PropTypes.func.isRequired,
            updateFeature: PropTypes.func.isRequired,
            createFeature: PropTypes.func.isRequired,
        }).isRequired,
    };

    renderItem = ({title, icon, numEquipmentTypes}) => (
        <>
            <List.Content>
                <Icon name={icon || 'cog'} size="big" />
            </List.Content>
            <List.Content styleName="info">
                <List.Header>
                    <span styleName="name">{title}</span>
                </List.Header>
                <List.Description>
                    {!numEquipmentTypes ? (
                        <Translate>Currently unused</Translate>
                    ) : (
                        <PluralTranslate count={numEquipmentTypes}>
                            <Singular>
                                Provided by <Param name="count" wrapper={<strong />}>1</Param> equipment type
                            </Singular>
                            <Plural>
                                Provided by
                                {' '}
                                <Param name="count" wrapper={<strong />} value={numEquipmentTypes} />
                                {' '}
                                equipment types
                            </Plural>
                        </PluralTranslate>
                    )}
                </List.Description>
            </List.Content>
        </>
    );

    renderForm = fprops => {
        const iconOptions = ICONS_AND_ALIASES.map(icon => ({
            key: icon,
            value: icon,
            text: icon,  // XXX: showing an actual icon here would be nice but then we cannot search
            icon,
        }));

        return (
            <>
                <Field name="name" component={ReduxFormField} as="input"
                       required
                       format={formatters.slugify} formatOnBlur
                       label={Translate.string('Name')}
                       disabled={fprops.submitting}
                       autoFocus />
                <Field name="title" component={ReduxFormField} as="input"
                       required
                       format={formatters.trim} formatOnBlur
                       label={Translate.string('Title')}
                       disabled={fprops.submitting} />
                <Field name="icon" component={ReduxDropdownField} parse={null}
                       search selection options={iconOptions}
                       label={Translate.string('Icon')}
                       disabled={fprops.submitting} />
            </>
        );
    };

    renderDeleteMessage = (item) => {
        const {title, numEquipmentTypes} = item;

        return (
            <>
                <Translate>
                    Are you sure you want to delete the feature
                    {' '}
                    <Param name="name" wrapper={<strong />} value={title} />?
                </Translate>
                {numEquipmentTypes > 0 && (
                    <>
                        <br />
                        <PluralTranslate count={numEquipmentTypes}>
                            <Singular>
                                It is currently provided by <Param name="count" wrapper={<strong />}>1</Param>
                                {' '}
                                equipment type.
                            </Singular>
                            <Plural>
                                It is currently provided by
                                {' '}
                                <Param name="count" wrapper={<strong />} value={numEquipmentTypes} />
                                {' '}
                                equipment types.
                            </Plural>
                        </PluralTranslate>
                    </>
                )}
            </>
        );
    };

    render() {
        const {
            isFetching, features,
            actions: {createFeature, updateFeature, deleteFeature},
        } = this.props;

        return (
            <EditableList title={Translate.string('Features')}
                          addModalTitle={Translate.string('Add feature')}
                          isFetching={isFetching}
                          items={features}
                          renderItem={this.renderItem}
                          renderAddForm={this.renderForm}
                          renderEditForm={this.renderForm}
                          renderDeleteMessage={this.renderDeleteMessage}
                          onCreate={createFeature}
                          onUpdate={updateFeature}
                          onDelete={deleteFeature} />
        );
    }
}


export default connect(
    state => ({
        isFetching: adminSelectors.isFetchingFeaturesOrEquipmentTypes(state),
        features: adminSelectors.getFeatures(state),
    }),
    dispatch => ({
        actions: bindActionCreators({
            deleteFeature: ({id}) => adminActions.deleteFeature(id),
            updateFeature: ({id}, data) => adminActions.updateFeature(id, data),
            createFeature: adminActions.createFeature,
        }, dispatch),
    })
)(RoomFeatureList);
