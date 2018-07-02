//@flow
import React, {type Node} from 'react';

import Avatar from '@atlaskit/avatar';
import {components} from '@atlaskit/select';
import {Field} from '@atlaskit/form';

import {LargeSelect} from './LargeSelect';
import type {SingleValueType} from './types';

import {ajaxGet} from '../../service/ajaxHelper';
import type {OptMutableFieldProps, FieldProps, FormFieldProps, SelectProps, AkFormFieldProps} from '../types';


function ValueImpl({data, children}: any): Node {
    return (
        <div className="flex-row">
            {data.imgSrc && <Avatar size="xsmall" src={data.imgSrc}/>}
            <span className="flex-vertical-middle" style={{marginLeft: data.imgSrc ? '5px' : ''}}>
                {children}
            </span>
        </div>
    );
}

function OptionImpl({data, children, ...props}: any): Node {
    return (
        <components.Option
            {...props}
        >
            <ValueImpl data={data}>{children}</ValueImpl>
        </components.Option>
    );
}

function SingleValueImpl({data, children, ...props}: any): Node {
    return (
        <components.SingleValue {...props}>
            {props.in && <ValueImpl data={data}>{children}</ValueImpl>}
        </components.SingleValue>
    );
}

let i: number = 0;

type ValueType = SingleValueType | $ReadOnlyArray<SingleValueType>;

type Props<T: ValueType> = FieldProps & FormFieldProps & OptMutableFieldProps<T> & AkFormFieldProps & SelectProps & {
    src: string
};

type DataType = {
    complete: boolean,
    options: $ReadOnlyArray<ValueType>
};

type AsyncPickerState = {
    filter: string,
    data: DataType,
    fetching: ?number
};

export class AsyncPicker<T: ValueType> extends React.PureComponent<Props<T>, AsyncPickerState> {
    static defaultProps = {
        isValidationHidden: false
    };

    i = i++;

    state = {
        filter: '',
        data: {
            complete: false,
            options: []
        },
        fetching: null
    };

    reqId = 0;

    _getOptions = (filter: string) => {
        const reqId = ++this.reqId;

        let needsFetching: boolean = !this.state.data.complete;
        this.setState({ fetching: needsFetching ? this.reqId : null, filter });

        if (needsFetching) {
            ajaxGet(this.props.src + (filter ? `?q=${filter}` : ''))
                .then((data: DataType) => {
                    this.setState((state: AsyncPickerState): any => {
                        if (reqId === state.fetching) {
                            return {
                                data,
                                fetching: null
                            };
                        } else {
                            return {};
                        }
                    });
                }
            );
        }
    };

    _onFilterChange = (filter: string) => {
        this._getOptions(filter);
    };

    componentDidMount() {
        const {value} = this.props;

        if (!Array.isArray(value)) {
            this._getOptions(value ? value.label : '');
        }
    }

    componentWillReceiveProps(props: Props<T>) {
        const value = props.value;
        if (this.props.value !== value) {
            if (!Array.isArray(value)) {
                this._getOptions(value ? value.label : '');
            }
        }
    }

    render() {
        const {label, isRequired, isLabelHidden, isInvalid, invalidMessage, isValidationHidden, components} = this.props;
        const {fetching, data} = this.state;

        if (isValidationHidden) {
            return (
                <LargeSelect
                    {...this.props}
                    shouldFitContainer={true}

                    hasAutocomplete={true}
                    onInputChange={this._onFilterChange}

                    isLoading={!!fetching}
                    options={data.options}

                    validationState={isInvalid ? 'error' : 'default'}

                    components={{
                        Option: OptionImpl,
                        SingleValue: SingleValueImpl,
                        ...(components || {})
                    }}
                />
            );
        }

        return (
            <Field
                label={label || ''}
                isLabelHidden={isLabelHidden}
                isRequired={isRequired}

                isInvalid={isInvalid}
                //$FlowFixMe
                invalidMessage={invalidMessage}

                validateOnChange={false}
                validateOnBlur={false}
            >
                <LargeSelect
                    {...this.props}
                    shouldFitContainer={true}

                    hasAutocomplete={true}
                    onInputChange={this._onFilterChange}

                    isLoading={!!fetching}
                    options={data.options}

                    components={{
                        Option: OptionImpl,
                        SingleValue: SingleValueImpl,
                        ...(components || {})
                    }}
                />
            </Field>
        );
    }
}
