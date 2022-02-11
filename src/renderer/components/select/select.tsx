/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Wrapper for "react-select" component
// API docs: https://react-select.com/
import "./select.scss";

import React, { ReactNode } from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import ReactSelect, { ActionMeta, components, OptionTypeBase, Props as ReactSelectProps, Styles } from "react-select";
import ReactSelectCreatable, { CreatableProps } from "react-select/creatable";
import { boundMethod, cssNames } from "../../utils";
import type { ActiveTheme } from "../../themes/active.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeThemeInjectable from "../../themes/active.injectable";

const { Menu } = components;

export interface GroupSelectOption<T extends SelectOption = SelectOption> {
  label: ReactNode;
  options: T[];
}

export interface SelectOption<T = any> {
  value: T;
  label?: React.ReactNode;
}

export interface SelectProps<T = any> extends ReactSelectProps<T, boolean>, CreatableProps<T, boolean> {
  value?: T;
  themeName?: "dark" | "light" | "outlined" | "lens";
  menuClass?: string;
  isCreatable?: boolean;
  autoConvertOptions?: boolean; // to internal format (i.e. {value: T, label: string}[]), not working with groups
  onChange?(option: T, meta?: ActionMeta<any>): void;
}

interface Dependencies {
  activeTheme: ActiveTheme;
}

@observer
class NonInjectedSelect extends React.Component<SelectProps & Dependencies> {
  static defaultProps: SelectProps = {
    autoConvertOptions: true,
    menuPortalTarget: document.body,
    menuPlacement: "auto",
  };

  constructor(props: SelectProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get themeClass() {
    const themeName = this.props.themeName || this.props.activeTheme.value.type;

    return `theme-${themeName}`;
  }

  private styles: Styles<OptionTypeBase, boolean> = {
    menuPortal: styles => ({
      ...styles,
      zIndex: "auto",
    }),
  };

  protected isValidOption(opt: SelectOption | any) {
    return typeof opt === "object" && opt.value !== undefined;
  }

  @computed get selectedOption() {
    const { value, isMulti } = this.props;

    if (isMulti) {
      return this.options.filter(opt => {
        const values = value ? [].concat(value) : [];

        return values.includes(opt) || values.includes(opt.value);
      });
    }

    return this.options.find(opt => opt === value || opt.value === value) || null;
  }

  @computed get options(): SelectOption[] {
    const { autoConvertOptions, options } = this.props;

    if (autoConvertOptions && Array.isArray(options)) {
      return options.map(opt => {
        return this.isValidOption(opt) ? opt : { value: opt, label: String(opt) };
      });
    }

    return options as SelectOption[];
  }

  @boundMethod
  onChange(value: SelectOption, meta: ActionMeta<any>) {
    this.props.onChange?.(value, meta);
    this.props.onValueChange?.(value.value);
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<HTMLElement>) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(evt);
    }
    const escapeKey = evt.nativeEvent.code === "Escape";

    if (escapeKey) evt.stopPropagation(); // don't close the <Dialog/>
  }

  render() {
    const {
      className, menuClass, isCreatable, autoConvertOptions,
      value, options, components = {}, ...props
    } = this.props;
    const WrappedMenu = components.Menu ?? Menu;

    const selectProps: Partial<SelectProps> = {
      ...props,
      styles: this.styles,
      value: autoConvertOptions ? this.selectedOption : value,
      options: autoConvertOptions ? this.options : options,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      className: cssNames("Select", this.themeClass, className),
      classNamePrefix: "Select",
      components: {
        ...components,
        Menu: props => (
          <WrappedMenu
            {...props}
            className={cssNames(menuClass, this.themeClass, props.className)}
          />
        ),
      },
    };

    return isCreatable
      ? <ReactSelectCreatable {...selectProps}/>
      : <ReactSelect {...selectProps}/>;
  }
}

export const Select = withInjectables<Dependencies, SelectProps>(NonInjectedSelect, {
  getProps: (di, props) => ({
    ...props,
    activeTheme: di.inject(activeThemeInjectable),
  }),
});
