function validator(options) {
    var form = document.querySelector(options.formTarget);
    var arrElement = {};
    var isValid = true;

    if (form) {
        options.rules.forEach(function (rule) {
            var targetElement = form.querySelector(rule.selector);

            if (targetElement) {
                if (Array.isArray(arrElement[rule.selector])) {
                    arrElement[rule.selector].push(rule);
                } else {
                    arrElement[rule.selector] = [rule];
                }
                targetElement.onblur = function () {
                    isValid = checkValid(targetElement, arrElement[rule.selector], options.nameClassRootInput);
                }
            }
        })
        form.onsubmit = function (e) {
            e.preventDefault();
            options.rules.forEach(function (rule) {

                var targetElement = form.querySelector(rule.selector);
                if (!checkValid(targetElement, arrElement[rule.selector], options.nameClassRootInput)) {
                    isValid = false;
                }
            })
            if (isValid) {
                var inputElements = form.querySelectorAll('[name]');
                var arrValueInput = Array.from(inputElements).reduce(function (arr, inputElement) {
                    if(arr[inputElement.name]){
                        arr[inputElement.name]=form.querySelector(`[name=${inputElement.name}]:checked`).value;
                    }else
                        arr[inputElement.name] = inputElement.value;
                    return arr;
                }, {})
                options.onSubmit(arrValueInput);
            }
        }
    }
    function checkValid(targetElement, rule, rootInputClassName) {
        var rootInputElement = rootParentInput(targetElement, rootInputClassName);
        var errorElement = rootInputElement.querySelector('.form-input__message');
        var messageTest;
        var targetValue;
        
        switch (targetElement.type) {
            case 'radio':
            case 'checkbox':
                if(form.querySelector(`${rule[0].selector}:checked`)){
                    targetValue=form.querySelector(`${rule[0].selector}:checked`).value;
                }else{
                    targetValue='';
                }
                messageTest=rule[0].test(targetValue);
                break;
            default:
                targetValue = targetElement.value;
                for (var i = 0; i < rule.length; i++) {
                    messageTest = rule[i].test(targetValue);
                    if (messageTest) break;
                }
                break;
        }
        if (messageTest) {
            errorElement.innerText = messageTest;
            rootInputElement.classList.add('form-input__error');
            rewrite(targetElement, 'form-input__error', '.form-input__message',form.nameClassRootInput);
        } else {
            errorElement.innerText = "";
            rootInputElement.classList.remove('form-input__error');
        }
        return !messageTest;
    }
    function rewrite(targetElement, classError, elementMessage) {
        switch(targetElement.type){
            case 'radio':
            case 'checkbox':
                targetElement= form.querySelectorAll(`input[name=${targetElement.name}]`);

                Array.from(targetElement).forEach(function(e){
                    e.onfocus=function(){
                        var parentInputElement = rootParentInput(e, options.nameClassRootInput)
                        parentInputElement.querySelector(elementMessage).innerText = '';
                        var errorElement = parentInputElement;
                        errorElement.classList.remove(classError);
                    }
                })
            break;
            default:
                targetElement.onclick = function () {
                    var parentInputElement = rootParentInput(targetElement, options.nameClassRootInput)
                    parentInputElement.querySelector(elementMessage).innerText = '';
                    var errorElement = parentInputElement;
                    errorElement.classList.remove(classError);
                }
                break;
        }
        
    }
    

}
function rootParentInput(element, parentNameClass) {
    
    while (element.parentElement) {
        var result = element.parentElement
        if (result.matches(parentNameClass))
            return result;
        element = result;
    }
}


validator.isFill = function (obj, message) {
    return {
        selector: obj,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui l??ng nh???p tr?????ng n??y';
        }
    }
}
validator.isEmail = function (obj, message) {
    return {
        selector: obj,
        test: function (value) {
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value) ? undefined : message || 'Vui l??ng nh???p ch??nh x??c Email c???a b???n';
        }
    }
}
validator.isPassword = function (obj, message) {
    return {
        selector: obj,
        test: function (value) {
            var regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
            return regex.test(value) ? undefined : message || 'M???t kh???u ch???a ??t nh???t 6 k?? t??? v?? ph???i bao g???m ch??? v?? s???';
        }
    }
}
validator.isMatchPassword = function (obj, originValue, message) {
    return {
        selector: obj,
        test: function (value) {
            return value === originValue() ? undefined : message || 'Gi?? tr??? kh??ng ch??nh x??c';
        }
    }
}