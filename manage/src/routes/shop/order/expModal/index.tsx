import {
  EuiButton,
  EuiButtonEmpty,
  EuiHorizontalRule,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
} from '@elastic/eui';
import _ from 'lodash';
import Form, { Field, useForm } from 'rc-field-form';
import * as React from 'react';
import { useState } from 'react';
import { ExpTypeNo } from '../../../../components/formControls';
import FormList from '../../../../components/formList';
import { useMessageMuation } from '../../../../hook/useMessageMuation';
import { useOrderById } from '../../../../hook/useOrder';
import { useOrderMuation } from '../../../../hook/useOrderMuation';
import { useToast } from '../../../../hook/useToast';
import ExpTable from '../expTable';

export interface IExpModalProps {
  onSucc: any;
}

const ExpModal: any = React.forwardRef((props: IExpModalProps, ref) => {
  const { sendSubscribeMessage } = useMessageMuation();
  const [orderId, setOrderId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { sendExp } = useOrderMuation();

  const { showToast } = useToast();
  const closeModal = () => setIsModalVisible(false);

  const showModal = () => setIsModalVisible(true);

  const {
    data: editData,
    error: editError,
    mutate: editMutate,
  }: any = useOrderById(orderId);
  const isEditLoading = !editError && !editData;

  React.useImperativeHandle(ref, () => ({
    show: orderId => {
      setOrderId(orderId);
      showModal();
    },
  }));

  let modal;
  // ==================== Form
  const [form] = useForm();

  const clearForm = () => {
    form.setFieldsValue({
      _id: null,
      exp: [{ expType: '', expNumber: '' }],
    });
  };

  const handleFinish = values => {
    sendExp(orderId, values, err => {
      if (!err) {
        editMutate();
        closeModal();
        showToast('ๅ่ดงๆๅ');
        clearForm();
        props.onSucc();
      }
    });
  };

  const saveAndSend = async () => {
    const values = await form.validateFields();
    if (values.exp.length > 0) {
      handleFinish(values);
      setTimeout(() => {
        sendSubscribeMessage(orderId, () => {});
      }, 1000);
    }
  };

  const renderForm = () => {
    if (orderId && !_.isEmpty(editData) && !isEditLoading) {
      if (form) {
        // if (editData.exp && editData.exp.length == 0) {
        // editData.exp = [{ expType: '', expNumber: '', title: '' }];
        editData.exp = _.map(editData.psns, (psn, index) => {
          const exp = editData.exp[index]
            ? editData.exp[index]
            : { expType: '', expNumber: '' };
          return {
            expType: exp.expType,
            expNumber: exp.expNumber,
            title: `${psn.product_title} ${psn.spec_title} x ${psn.num}`,
          };
        });
        // }
        form.setFieldsValue(editData);
      }
      // console.log(editData);

      return (
        <Form
          form={form}
          validateMessages={{
            default: '${name} ็่ตทๆฅๆชๆช็โฆโฆ',
            required: 'ไฝ?้่ฆไธไธช ${displayName}',
            types: {
              number: 'ๅจ๏ผ่ฟไธช ${name} ไธๆฏไธไธชๅๆ?ผ็ ${type}',
            },
            enum: '${name} ไธๅจ ${enum} ไธญๅข',
            whitespace: '${name} ไธๅฏไปฅๆฏ็ฉบ็ๅฆ',
            pattern: {
              mismatch: '${name} ๅนถไธ็ฌฆๅๆ?ผๅผ๏ผ${pattern}',
            },
          }}
          onFinish={values => {
            if (values.exp.length > 0) {
              handleFinish(values);
            }
          }}
          style={{ width: '800px' }}
          className="euiForm"
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              {`${editData.name} ${editData.phone}`}
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <FormList
              name="exp"
              label="ๅฟซ้"
              psns={editData.psns}
              fullWidth={true}
              messageVariables={{ displayName: 'ๅฟซ้' }}
            >
              <ExpTypeNo />
            </FormList>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButtonEmpty onClick={closeModal}>ๅๆถ</EuiButtonEmpty>

            <EuiButton type="submit" fill>
              ไฟๅญ
            </EuiButton>

            <EuiButton onClick={saveAndSend} fill>
              ไฟๅญๅนถๅ้้็ฅ
            </EuiButton>
          </EuiModalFooter>
        </Form>
      );
    } else {
      return (
        <>
          <EuiModalHeader>
            <EuiModalHeaderTitle>ๅ่ดง</EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiLoadingSpinner size="xl" />
          </EuiModalBody>
        </>
      );
    }
  };

  if (isModalVisible) {
    modal = (
      <EuiOverlayMask>
        <EuiModal maxWidth={800} onClose={closeModal}>
          {renderForm()}
          <EuiHorizontalRule margin="s" />
          {!_.isEmpty(editData) && (
            <EuiModalBody>
              <ExpTable phone={editData.phone} />
            </EuiModalBody>
          )}
        </EuiModal>
      </EuiOverlayMask>
    );
  }

  return <>{modal}</>;
});

export default ExpModal;
