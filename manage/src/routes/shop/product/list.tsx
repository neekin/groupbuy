import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiTitle,
  EuiPageContentBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormControlLayout,
  EuiFormRow,
  EuiFieldSearch,
  EuiButton,
  EuiSpacer,
  EuiBasicTable,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiText,
  EuiFieldText,
  EuiFieldPassword,
  EuiConfirmModal,
  EuiOverlayMask,
  EuiTextColor,
  EuiFieldNumber,
  EuiSwitch,
} from '@elastic/eui';
import _ from 'lodash';
import moment from 'moment';
import Form, { Field, useForm } from 'rc-field-form';
import * as React from 'react';
import { useRef, useState } from 'react';
import {
  ColorPicker,
  ComboBox,
  DatePicker,
  DatePickerRange,
  Switch,
} from '../../../components/formControls';
import ContentEditor from '../../../components/formControls/contentEditor';
import FieldNumber from '../../../components/formControls/fieldNumber';
import FilePicker from '../../../components/formControls/filePicker';
import FormRow from '../../../components/formRow';
import { useProduct, useProductById } from '../../../hook/useProduct';
import { useProductMuation } from '../../../hook/useProductMuation';
import { useTag } from '../../../hook/useTag';
import { useToast } from '../../../hook/useToast';
import ProductSpecList from './spec/list';

export interface IProductListProps {}

export default function ProductList(props: IProductListProps) {
  // ==================== Table
  const [dataParams, setDataParams] = useState({
    pageIndex: 0,
    pageSize: 100,
    sortField: 'sort',
    sortDirection: 'desc',
    search: '',
  });

  const [editId, setEditId] = useState(null);
  const [productId, setProductId] = useState(null);
  const { data: tags }: any = useTag();
  const { data, error, mutate }: any = useProduct(dataParams);
  const {
    data: editData,
    error: editError,
    mutate: editMutate,
  }: any = useProductById(editId);

  const [selectedItems, setSelectedItems] = useState([]);
  const isLoading = !error && !data;
  const isEditLoading = !editError && !editData;

  const { create, update, destroy, state } = useProductMuation();

  const { showToast } = useToast();

  const tableRef: any = useRef();

  const onTableChange = ({ page, sort }: any) => {
    const oriPage = { index: dataParams.pageIndex, size: dataParams.pageSize };
    const { index: pageIndex, size: pageSize } = page ? page : oriPage;
    const { field: sortField, direction: sortDirection } = sort;
    const newParams = _.merge({}, dataParams, {
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
    });
    setDataParams(newParams);
  };

  const onSearchChange = search => {
    const fn = () => {
      const newParams = _.merge({}, dataParams, { pageIndex: 0, search });
      setDataParams(newParams);
    };
    _.debounce(() => {
      fn();
    }, 500)();
  };

  const onSelectionChange = selectedItems => {
    setSelectedItems(selectedItems);
  };

  const renderDeleteButton = () => {
    if (selectedItems.length === 0) {
      return;
    }
    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          color="danger"
          onClick={() => {
            const ids = selectedItems.map((o: any) => {
              return o._id;
            });
            showDestroyModal(ids);
          }}
        >
          ?????? ({selectedItems.length})
        </EuiButton>
      </EuiFlexItem>
    );
  };

  const pagination: any = {
    pageIndex: dataParams.pageIndex,
    pageSize: dataParams.pageSize,
    totalItemCount: data && data.count != undefined ? data.count : 0,
    hidePerPageOptions: true,
  };

  const sorting: any = {
    sort: {
      field: dataParams.sortField,
      direction: dataParams.sortDirection,
    },
  };

  const selection: any = {
    selectable: data => {
      return true; //TODO selectable
    },
    selectableMessage: selectable => (!selectable ? '????????????' : undefined),
    onSelectionChange: onSelectionChange,
    initialSelected: [],
  };

  const actions = [
    {
      name: '??????',
      available: data => true, //TODO
      description: '??????',
      icon: 'submodule',
      type: 'icon',
      onClick: item => {
        showFlyoutSpec(item._id);
      },
      isPrimary: true,
      'data-test-subj': 'action-edit',
    },
    {
      name: '??????',
      available: data => true, //TODO
      description: '??????',
      icon: 'pencil',
      type: 'icon',
      onClick: item => {
        showFlyout(item._id);
      },
      isPrimary: true,
      'data-test-subj': 'action-edit',
    },
    {
      name: item => (item._id ? '??????' : ''),
      available: data => true, //TODO
      description: '??????',
      icon: 'trash',
      color: 'danger',
      type: 'icon',
      onClick: item => {
        showDestroyModal([item._id]);
      },
      isPrimary: true,
      'data-test-subj': 'action-delete',
    },
  ];

  const columns: any = [
    {
      field: 'title',
      name: '??????',
      width: '200px',
    },
    {
      field: 'state',
      name: '??????',
      render: (state, rec) => {
        return (
          <Switch
            value={state == 0 ? false : true}
            label="state"
            showLabel={false}
            onChange={() => {
              update(rec._id, { state: state == 0 ? 1 : 0 }, err => {
                if (!err) {
                  // mutate();
                  showToast(`${rec.title}${state == 0 ? '?????????' : '?????????'}`);
                }
              });
            }}
          ></Switch>
        );
      },
    },
    {
      field: 'sort',
      sortable: true,
      name: '??????',
    },
    {
      field: 'updatedAt',
      name: '????????????',
      sortable: true,
      render: time => moment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      name: '??????',
      actions,
    },
  ];

  const renderDataTableCtl = () => {
    return (
      <EuiFlexGroup
        gutterSize="l"
        justifyContent="spaceBetween"
        direction="row"
        responsive
      >
        <EuiFlexItem grow={2}>
          <EuiFlexGroup gutterSize="s" direction="row" responsive>
            {renderDeleteButton()}
            <EuiFlexItem grow={1}>
              <EuiFormControlLayout fullWidth>
                <EuiFormRow fullWidth>
                  <EuiFieldSearch
                    placeholder="??????..."
                    fullWidth
                    onChange={e => onSearchChange(e.target.value)}
                    isClearable={true}
                  />
                </EuiFormRow>
              </EuiFormControlLayout>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiFlexGroup
            gutterSize="s"
            justifyContent="flexEnd"
            direction="row"
            responsive
            wrap
          >
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                iconType="plusInCircle"
                onClick={() => {
                  showFlyout(null);
                }}
              >
                ??????
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  const renderDataTable = () => {
    return (
      <EuiBasicTable
        compressed
        loading={isLoading}
        ref={tableRef}
        items={data && data.list != undefined ? data.list : []}
        itemId="_id"
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        isSelectable={true}
        selection={selection}
        onChange={onTableChange}
        rowHeader="title"
      />
    );
  };

  const [destroyModalConf, setDestroyModalConf] = useState({
    isDestroyModalVisible: false,
    ids: null,
  });
  const closeDestroyModal = () =>
    setDestroyModalConf({ isDestroyModalVisible: false, ids: null });
  const showDestroyModal = ids =>
    setDestroyModalConf({ isDestroyModalVisible: true, ids });
  const confirmDestroy = () => {
    // destroyModalConf.id
    // destroyModalConf.ids
    if (destroyModalConf.ids) {
      destroy(destroyModalConf.ids, err => {
        if (!err) {
          showToast('????????????');
          mutate();
        }
      });
    }
    closeDestroyModal();
  };
  let destroyModal;
  if (destroyModalConf.isDestroyModalVisible) {
    destroyModal = (
      <EuiOverlayMask>
        <EuiConfirmModal
          title="?????????????????? ???"
          onCancel={closeDestroyModal}
          onConfirm={confirmDestroy}
          cancelButtonText="??????"
          confirmButtonText="??????"
          buttonColor="danger"
          defaultFocusedButton="confirm"
        >
          <p>????????????????????? !</p>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }

  // ==================== Form
  const [form] = useForm();
  const clearForm = () => {
    form.setFieldsValue({
      // TODO
      _id: null,
      title: null,
      sort: null,
      price: null,
      price_o: null,
      end: null,
      tags: null,
      desc: null,
      color: null,
      kv: null,
      thumb: null,
      info: null,
      verify: null,
    });
  };
  const handleFinish = values => {
    if (!editId) {
      create(values, err => {
        if (!err) {
          mutate();
          closeFlyout();
          showToast('????????????');
        }
      });
    } else {
      update(editId, values, err => {
        if (!err) {
          mutate();
          closeFlyout();
          showToast('????????????');
        }
      });
    }
  };

  const renderForm = () => {
    if ((editId && !_.isEmpty(editData) && !isEditLoading) || !editId) {
      if (form) {
        form.setFieldsValue(editData);
      }

      return (
        <Form
          form={form}
          validateMessages={{
            default: '${name} ????????????????????????',
            required: '??????????????? ${displayName}',
            types: {
              number: '???????????? ${name} ????????????????????? ${type}',
            },
            enum: '${name} ?????? ${enum} ??????',
            whitespace: '${name} ?????????????????????',
            pattern: {
              mismatch: '${name} ?????????????????????${pattern}',
            },
          }}
          onFinish={handleFinish}
          className="euiForm"
        >
          <EuiFlexGroup gutterSize="m" direction="column">
            <EuiFlexItem>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem>
                  <FormRow
                    name="title"
                    label="??????"
                    messageVariables={{ displayName: '??????' }}
                    rules={[{ required: true }]}
                  >
                    <EuiFieldText />
                  </FormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <FormRow
                    name="sort"
                    label="??????"
                    messageVariables={{ displayName: '??????' }}
                    rules={[{ required: true }, { type: 'number' }]}
                  >
                    <FieldNumber />
                  </FormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem>
                  <FormRow
                    name="desc"
                    label="?????????"
                    messageVariables={{ displayName: 'desc' }}
                  >
                    <EuiFieldText />
                  </FormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <FormRow
                    name="color"
                    label="??????????????????"
                    messageVariables={{ displayName: 'color' }}
                    rules={[{ required: true }]}
                  >
                    <ColorPicker />
                  </FormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem>
                  <FormRow
                    name="price"
                    label="??????"
                    messageVariables={{ displayName: 'price' }}
                    rules={[{ required: true }, { type: 'number' }]}
                  >
                    <FieldNumber />
                  </FormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <FormRow
                    name="price_o"
                    label="??????"
                    messageVariables={{ displayName: 'price_o' }}
                    rules={[{ required: true }, { type: 'number' }]}
                  >
                    <FieldNumber />
                  </FormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem>
                  <FormRow
                    name="end"
                    label="????????????"
                    messageVariables={{ displayName: 'end' }}
                    rules={[{ required: true }]}
                  >
                    <DatePicker showTimeSelect />
                  </FormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <FormRow
                    name="tags"
                    label="??????"
                    messageVariables={{ displayName: 'tags' }}
                    rules={[{ required: true }]}
                  >
                    <ComboBox
                      options={tags.list.map(tag => {
                        return {
                          label: tag.label,
                          value: tag._id,
                        };
                      })}
                      isClearable={false}
                    />
                  </FormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>

            <EuiFlexItem>
              <EuiFlexGroup gutterSize="m">
                <EuiFlexItem>
                  <FormRow
                    name="kv"
                    label="????????????"
                    helpText="?????? 714x272"
                    messageVariables={{ displayName: '????????????' }}
                  >
                    <FilePicker />
                  </FormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <FormRow
                    name="thumb"
                    label="?????????"
                    helpText="?????? 348x390"
                    messageVariables={{ displayName: '?????????' }}
                  >
                    <FilePicker />
                  </FormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              <FormRow
                name="info"
                label="??????"
                fullWidth={true}
                messageVariables={{ displayName: '??????' }}
              >
                <ContentEditor style={{ minHeight: '600px' }} />
              </FormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <FormRow
                name="verify"
                label="verify"
                messageVariables={{ displayName: 'verify' }}
                rules={[{ required: true }]}
              >
                <Switch label="verify" />
              </FormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <Field name="createdAt">
            {(control, meta, context) => {
              const { createdAt } = context.getFieldsValue(true);
              return (
                createdAt && (
                  <EuiFormRow label="createdAt">
                    <EuiText color="subdued" size="s">
                      {moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </EuiText>
                  </EuiFormRow>
                )
              );
            }}
          </Field>
          <Field name="updatedAt">
            {(control, meta, context) => {
              const { updatedAt } = context.getFieldsValue(true);
              return (
                updatedAt && (
                  <EuiFormRow label="updatedAt">
                    <EuiText color="subdued" size="s">
                      {moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </EuiText>
                  </EuiFormRow>
                )
              );
            }}
          </Field>

          <EuiSpacer />

          <EuiButton type="submit" fill>
            ??????
          </EuiButton>
        </Form>
      );
    }
  };
  // ==================== Flyout

  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);

  const closeFlyout = () => {
    clearForm();
    editMutate({}, false);
    setEditId(null);
    setIsFlyoutVisible(false);
  };

  const showFlyout = id => {
    setEditId(id);
    setIsFlyoutVisible(true);
  };

  let flyout;

  if (isFlyoutVisible) {
    flyout = (
      <EuiFlyout
        ownFocus
        onClose={closeFlyout}
        size="m"
        aria-labelledby="flyoutSmallTitle"
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="s">
            <h2 id="flyoutSmallTitle">??????</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>{renderForm()}</EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  // ==================== FlyoutSpec

  const [isFlyoutSpecVisible, setIsFlyoutSpecVisible] = useState(false);

  const closeFlyoutSpec = () => {
    setProductId(null);
    setIsFlyoutSpecVisible(false);
  };

  const showFlyoutSpec = id => {
    setProductId(id);
    setIsFlyoutSpecVisible(true);
  };

  let flyoutSpec;

  if (isFlyoutSpecVisible) {
    flyoutSpec = (
      <EuiFlyout
        ownFocus
        onClose={closeFlyoutSpec}
        size="l"
        aria-labelledby="flyoutSmallTitle"
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="s">
            <h2 id="flyoutSmallTitle">??????</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <ProductSpecList productId={productId} />
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle>
                <h2>??????</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
            <EuiPageContentHeaderSection></EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiPageContentBody>
            {renderDataTableCtl()}
            <EuiSpacer />
            {renderDataTable()}
            {flyout}
            {flyoutSpec}
            {destroyModal}
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}
