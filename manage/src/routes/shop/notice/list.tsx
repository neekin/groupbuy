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
  EuiImage,
} from '@elastic/eui';
import _ from 'lodash';
import moment from 'moment';
import Form, { Field, useForm } from 'rc-field-form';
import * as React from 'react';
import { useRef, useState } from 'react';
import {
  ColorPicker,
  SuperSelect,
  Switch,
} from '../../../components/formControls';
import ContentEditor from '../../../components/formControls/contentEditor';
import FieldNumber from '../../../components/formControls/fieldNumber';
import FilePicker from '../../../components/formControls/filePicker';
import FormRow from '../../../components/formRow';
import { useNotice, useNoticeById } from '../../../hook/useNotice';
import { useNoticeMuation } from '../../../hook/useNoticeMuation';
import { useToast } from '../../../hook/useToast';

export interface INoticeListProps {}

export default function NoticeList(props: INoticeListProps) {
  // ==================== Table
  const [dataParams, setDataParams] = useState({
    pageIndex: 0,
    pageSize: 30,
    sortField: 'sort',
    sortDirection: 'desc',
    search: '',
  });

  const [editId, setEditId] = useState(null);
  const { data, error, mutate }: any = useNotice(dataParams);
  const {
    data: editData,
    error: editError,
    mutate: editMutate,
  }: any = useNoticeById(editId);

  const [selectedItems, setSelectedItems] = useState([]);
  const isLoading = !error && !data;
  const isEditLoading = !editError && !editData;

  const { create, update, destroy, state } = useNoticeMuation();

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
    totalItemCount: data ? data.count : 0,
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
      field: 'message',
      name: '??????',
    },
    {
      field: 'page',
      name: '??????',
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
                  showToast(`${rec.page}??????${state == 0 ? '??????' : '??????'}`);
                }
              });
            }}
          ></Switch>
        );
      },
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
        loading={isLoading}
        ref={tableRef}
        items={data ? data.list : []}
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
      _id: null,
      message: null,
      color: null,
      background: null,
      icon: null,
      page: null,
      createdAt: null,
      updatedAt: null,
      needFeedback: null,
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
          <FormRow
            name="message"
            label="????????????"
            messageVariables={{ displayName: '????????????' }}
            rules={[{ required: true }]}
          >
            <EuiFieldText />
          </FormRow>
          <FormRow
            name="color"
            label="????????????"
            messageVariables={{ displayName: '????????????' }}
            rules={[{ required: true }]}
          >
            <ColorPicker defaultColor="#1989fa" />
          </FormRow>
          <FormRow
            name="background"
            label="????????????"
            messageVariables={{ displayName: '????????????' }}
            rules={[{ required: true }]}
          >
            <ColorPicker defaultColor="#ecf9ff" />
          </FormRow>

          <FormRow
            name="icon"
            label="??????"
            messageVariables={{ displayName: '??????' }}
            rules={[{ required: true }]}
          >
            <SuperSelect
              options={[
                {
                  value: 'volume-o',
                  inputDisplay: 'volume-o',
                  dropdownDisplay: (
                    <React.Fragment>
                      <i className="van-icon van-icon-volume-o" />
                    </React.Fragment>
                  ),
                },
                {
                  value: 'like-o',
                  inputDisplay: 'like-o',
                  dropdownDisplay: (
                    <React.Fragment>
                      <i className="van-icon van-icon-like-o" />
                    </React.Fragment>
                  ),
                },
                {
                  value: 'new-arrival-o',
                  inputDisplay: 'new-arrival-o',
                  dropdownDisplay: (
                    <React.Fragment>
                      <i className="van-icon van-icon-new-arrival-o" />
                    </React.Fragment>
                  ),
                },
                {
                  value: 'hot-sale-o',
                  inputDisplay: 'hot-sale-o',
                  dropdownDisplay: (
                    <React.Fragment>
                      <i className="van-icon van-icon-hot-sale-o" />
                    </React.Fragment>
                  ),
                },
                {
                  value: 'newspaper-o',
                  inputDisplay: 'newspaper-o',
                  dropdownDisplay: (
                    <React.Fragment>
                      <i className="van-icon van-icon-newspaper-o" />
                    </React.Fragment>
                  ),
                },
              ]}
            />
          </FormRow>
          <FormRow
            name="page"
            label="??????"
            messageVariables={{ displayName: '??????' }}
            rules={[{ required: true }]}
          >
            <SuperSelect
              options={[
                {
                  value: 'confirm',
                  inputDisplay: '???????????????',
                  dropdownDisplay: <React.Fragment>???????????????</React.Fragment>,
                },
                {
                  value: 'detail',
                  inputDisplay: '???????????????',
                  dropdownDisplay: <React.Fragment>???????????????</React.Fragment>,
                },
                {
                  value: 'bag',
                  inputDisplay: '?????????',
                  dropdownDisplay: <React.Fragment>?????????</React.Fragment>,
                },
              ]}
            />
          </FormRow>
          <EuiFlexItem>
            <FormRow
              name="needFeedback"
              label="??????"
              messageVariables={{ displayName: '??????' }}
              rules={[{ required: true }]}
            >
              <Switch label="??????" />
            </FormRow>
          </EuiFlexItem>

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
        size="s"
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

  return (
    <EuiPage restrictWidth>
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
            {destroyModal}
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}
