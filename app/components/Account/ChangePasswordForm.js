import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { size } from 'lodash';
import * as firebase from 'firebase';
import { reauthenticate } from '../../utils/api';

export default function ChangePasswordForm(props) {
  const { setShowModal, toastRef } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(defaultValue());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  //La función se hace async porque en el reauthenticate del usuario hay que esperar lo que retorna
  //la promesa, entonces es para que no se ejecute lo demás que sigue luego de esta función, se le pone el
  //await porque así el render se espera a que se ejecute esa función para continuar con el render
  //y así no se agrega a setErrors el errorsTemp vacío.
  const onSubmit = async () => {
    //Esta variable es para saber si se van a cambiar los valores del objeto de errors para continuar
    //el render y si es false, entonces no hay problema porque no va a dar error ya que no se renderiza
    //el componente con una actualización, una vez ya desmontado el componente.
    let isSetErrors = true;

    //Esta es otra forma de actualizar los errores, creando un objeto temporal y pasandolo
    //a la función de cambio de estado de errors
    let errorsTemp = {};
    setErrors({});

    if (
      !formData.password ||
      !formData.newPassword ||
      !formData.repeatNewPassword
    ) {
      errorsTemp = {
        password: !formData.password
          ? 'La contraseña no puede estar vacía.'
          : '',
        newPassword: !formData.newPassword
          ? 'La contraseña no puede estar vacía.'
          : '',
        repeatNewPassword: !formData.repeatNewPassword
          ? 'La contraseña no puede estar vacía.'
          : '',
      };
    } else if (formData.newPassword !== formData.repeatNewPassword) {
      errorsTemp = {
        newPassword: 'Las contraseñas no son iguales.',
        repeatNewPassword: 'Las contraseñas no son iguales.',
      };
    } else if (size(formData.newPassword) < 6) {
      errorsTemp = {
        newPassword: 'La contraseña tiene que ser mayor a 5 caracteres',
        repeatNewPassword: 'La contraseña tiene que ser mayor a 5 caracteres',
      };
    } else {
      setIsLoading(true);
      await reauthenticate(formData.password)
        .then(async () => {
          await firebase
            .auth()
            .currentUser.updatePassword(formData.newPassword)
            .then(() => {
              isSetErrors = false;
              setIsLoading(false);
              setShowModal(false);
              firebase.auth().signOut();
            })
            .catch(() => {
              errorsTemp = {
                other: 'Error al actualizar la contraseña',
              };
              setIsLoading(false);
            });
        })
        .catch(() => {
          setIsLoading(false);
          errorsTemp = {
            password: 'La contraseña no es correcta.',
          };
        });
    }

    isSetErrors && setErrors(errorsTemp); //Los errores se ejecutan solo si es true la variable
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Contraseña actual"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={{
          type: 'material-community',
          name: showPassword ? 'eye-off-outline' : 'eye-outline',
          color: '#c2c2c2',
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => onChange(e, 'password')}
        errorMessage={errors.password}
      />
      <Input
        placeholder="Nueva contraseña"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={{
          type: 'material-community',
          name: showPassword ? 'eye-off-outline' : 'eye-outline',
          color: '#c2c2c2',
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => onChange(e, 'newPassword')}
        errorMessage={errors.newPassword}
      />
      <Input
        placeholder="Repetir nueva contraseña"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPassword ? false : true}
        rightIcon={{
          type: 'material-community',
          name: showPassword ? 'eye-off-outline' : 'eye-outline',
          color: '#c2c2c2',
          onPress: () => setShowPassword(!showPassword),
        }}
        onChange={(e) => onChange(e, 'repeatNewPassword')}
        errorMessage={errors.repeatNewPassword}
      />
      <Button
        title="Cambiar contraseña"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />

      <Text>{errors.other}</Text>
    </View>
  );
}

function defaultValue() {
  return {
    password: '',
    newPassword: '',
    repeatNewPassword: '',
  };
}

const styles = StyleSheet.create({
  view: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: '95%',
  },
  btn: {
    backgroundColor: '#00a680',
  },
});
