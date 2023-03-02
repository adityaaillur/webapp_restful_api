const bcrypt = require('bcrypt');

const validateNumber = (number) =>{

    if(isNaN(number)){
        return false;
    }else{
        return true;
    }

}

const  validatePassword = (password) => {
	let passwordValue = password;
	var password_regex1=/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

	if(password_regex1.test(passwordValue)==false){
		return false;
	}else{
		return true;
	}

}

const  validateEmail = (email) => {
    let regex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	if (regex.test(email) == false) {
	return false;
	} else {
	return true;
	}
}

const validateFirstAndLastName = (name) =>{
    let regex = /^[a-zA-Z]+$/;
    if (regex.test(name) == false) {
    return false;
    } else {
    return true;
    }
}

const encryptPassword = async (password) =>{
    // Encryption of the string password
        const Salt = await bcrypt.genSalt(10);
        return bcrypt.hashSync(password, Salt);    
}

const checkResponseForPost =  (response) =>{

    const knownKeys = ['firstName', 'lastName', 'username', 'password'];
    let isValid = false;    

    Object.keys(response).forEach(key => {
          if (!knownKeys.includes(key)){
            isValid = false;
          }else{
            isValid = true;
          }  
        });

        return isValid;

}

const checkResponseForPostProduct =  (response) =>{

    const knownKeys = ['name', 'description', 'sku', 'manufacturer',"quantity"];
    let isValid = false;    

    Object.keys(response).forEach(key => {
          if (!knownKeys.includes(key)){
            isValid = false;
          }else{
            isValid = true;
          }  
        });

        return isValid;

}

const checkResponseForPostProductImage =  (response) =>{

    const knownKeys = ['name', 'description', 'sku', 'manufacturer',"quantity"];
    let isValid = false;    

    Object.keys(response).forEach(key => {
          if (!knownKeys.includes(key)){
            isValid = false;
          }else{
            isValid = true;
          }  
        });

        return isValid;

}

const validateQuantity =  (quantity) =>{

    if(isNaN(quantity)){
        return false;
    }else{
        if(quantity <= 0 || quantity > 100){
            return false
        }else{
            return true
        }
    }
}

const validateQuantityPatch =  (quantity) =>{

    if(quantity == null){
        return true
    }else{
        if(isNaN(quantity)){
            return false;
        }else{
            if(quantity <= 0 || quantity > 100){
                return false
            }else{
                return true
            }
        }
    }


}

const validateProduct = (name)=>{
    if(name == null){
        return false
    }else{
        let regex = /^[a-zA-Z0-9 ]+$/;
        if (regex.test(name) == false) {
        return false;
        } else {
        return true;
        }
    }

}



module.exports = {
    validateNumber,
    validatePassword,
    validateEmail,
    validateFirstAndLastName,
    encryptPassword,
    checkResponseForPost,
    checkResponseForPostProduct,
    validateQuantity,
    validateProduct,
    validateQuantityPatch
};