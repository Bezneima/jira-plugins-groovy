import React from 'react';
import PropTypes from 'prop-types';

import {Editor} from '../common/Editor';
import {Bindings} from '../common/bindings';


export class FormEditor extends React.Component {
    static propTypes = {
        initialValue: PropTypes.string,
        fieldName: PropTypes.string.isRequired
    };

    state = {
        value: this.props.initialValue
    };

    _setValue = (value) => this.setState({ value });

    render() {
        return <div>
            <Editor
                decorated={true}
                bindings={[
                    Bindings.mutableIssue, Bindings.currentUser, Bindings.transientVars
                ]}

                mode="groovy"
                value={this.state.value}
                onChange={this._setValue}
            />
            <textarea
                className="hidden"

                readOnly={true}
                value={this.state.value}
                name={this.props.fieldName}
            />
        </div>;
    }
}
