/**
 * Created by focus on 2017/4/14.
 */

var defaultRules = require("./defaultRules");
var _ = require("lodash");
var domTools = require("./domTools");

/**
 * check value type
 * @param  {String}  type
 * @param  {*}  val
 * @return {Boolean}
 */
function is(type, val) {
    return Object.prototype.toString.call(val) === ("[object " + type + "]")
}

var Vue;

var Verify = function (VueComponent) {
    this.vm = VueComponent;
    this.verifyQueue = {};                        //验证队列
    Vue.util.defineReactive(this, '$errors', {});
};

var validate = function (field, rule) {
    var self = this;                          //this指向组件
    var vm = self;                         //Vue组件对象
    var value = _.get(vm, field);
    
    //如果为验证规则为数组则进行遍历
    if (Array.isArray(rule)) {
        return rule.map(function (item) {
                return validate.call(self, field, item);
            }).indexOf(false) === -1;
    }
    
    // 为字符串时调用默认规则
    if (is("String", rule)) {
        rule = defaultRules[rule];
    }
    
    // //如果验证规则不存在 结束
    if (!(rule && (rule.test || rule.maxLength || rule.minLength))) {
        console.warn("rule of " + field + " not define");
        return false;
    }
    
    
    var valid = true;
    if (rule && rule.test) {
        //验证数据
        valid = is("Function", rule.test) ? rule.test.call(this, value) : rule.test.test(value);
    }
    
    
    if (rule && rule.maxLength) {
        if (value.length > rule.maxLength) {
            valid = false;
            if (!rule.message) {
                rule.message = "至多" + rule.maxLength + "个字符";
            }
        }
    }
    
    if (rule && rule.minLength) {
        if (value.length < rule.minLength) {
            valid = false;
            if (!rule.message) {
                rule.message = "至少" + rule.maxLength + "个字符";
            }
        }
    }
    
    
    //错误对象
    var $error = _.get(vm.$verify.$errors, field);
    
    //验证未通过
    if (!valid) {
        $error.push(rule.message);
        vm.$verify.$errorArray.push(rule.message);
    }
    return valid;
};

Verify.prototype.check = function (group) {
    var self = this;
    var vm = this.vm;   //Vue实例
    var rules = vm.$options.verify;
    var verifyQueue;
    if (group) {
        if (!vm.$verify.verifyQueue[group]) {
            console.warn(group + " not found in the component");
        }
    }
    
    //分组处理
    if (group && vm.$verify.verifyQueue[group]) {
        verifyQueue = vm.$verify.verifyQueue[group];
    } else {
        verifyQueue = [];
        for (var k in vm.$verify.verifyQueue) {
            verifyQueue = verifyQueue.concat(verifyQueue, vm.$verify.verifyQueue[k])
        }
    }
    
    //错误数组,按照本次验证的顺序推入数组
    vm.$verify.$errorArray = [];
    
    //遍历验证队列进行验证
    return verifyQueue.map(function (item) {
            if (_.get(rules, item)) {
                _.set(vm.$verify.$errors, item, []);
                return validate.call(self.vm, item, _.get(rules, item));
            }
        }).indexOf(false) === -1;
    
    
};

var init = function () {
    var self = this;                    //this 指向Vue实例
    if (!self.$options.verify) {         //验证规则为空 结束
        return;
    }
    this.$verify = new Verify(self);    //添加vm实例验证属性
};

var verifyInit = function (_Vue, options) {
    Vue = _Vue;
    if (options && options.rules) {
        Object.assign(defaultRules, defaultRules, options.rules);
    }
    Vue.mixin({
        beforeCreate: init
    });
};

//自定义指令
var Directive = function (Vue, options) {
    Vue.directive("verify", {
        bind: function (el, binding, vnode, oldVnode) {
            var vm = vnode.context;//当前组件实例
            var expression = binding.expression;
            var errorClass = el.getAttribute('verify-class') || 'verify-error';
            
            //得到焦点 移除错误
            el.addEventListener("focus", function () {
                _.set(vm.$verify.$errors, expression, []);
            });
            
            //失去焦点 进行验证
            if (options && options.blur) {
                el.addEventListener("blur", function () {
                    vm.$verify.$errorArray = [];
                    validate.call(vm, expression, _.get(vm.$options.verify, expression));
                });
            }
            
            //添加到验证队列
            var group;
            if (binding.rawName.split(".").length > 1) {
                group = binding.rawName.split(".").pop();
            } else if (binding.arg) {
                //如果arg存在
                //v-verify:arg
                group = binding.arg;
            } else {
                group = "";
            }
            if (vm.$verify.verifyQueue[group]) {
                vm.$verify.verifyQueue[group].push(expression);
            } else {
                vm.$verify.verifyQueue[group] = [];
                vm.$verify.verifyQueue[group].push(expression);
            }
            
            /**
             *
             
             //添加数据监听绑定 getter setter
             Vue.util.defineReactive(vm.$verify.$errors, expression, []);
             
             //错误默认值为空
             _.set(vm.$verify.$errors, expression, []);
             */
            
            
            _.set(vm.$verify.$errors, expression, []);
            
            var tempExpression=expression.split(".");
            var tempErrors=vm.$verify.$errors;
            // debugger;
            for(let i=0;i<tempExpression.length-1;i++){
                tempErrors=tempErrors[tempExpression[i]];
            }
            var key=tempExpression[tempExpression.length-1];
            
            
            //添加数据监听绑定 getter setter
            Vue.util.defineReactive(tempErrors, key, []);
            
            
            // //错误默认值为空
            _.set(vm.$verify.$errors, expression, []);
            
            //监听错误 移除对应的Class
            vm.$watch("$verify.$errors." + expression, function (val) {
                if (val.length) {
                    domTools.addClass(el, errorClass);
                } else {
                    domTools.removeClass(el, errorClass);
                }
            });
        }
    });
    
    Vue.directive("verified", {
        update: function (el, binding, vnode, oldVnode) {
            if (binding.value && Array.isArray(binding.value) && binding.value.length > 0) {
                domTools.apply(el, true);
                if (binding.modifiers.join) {
                    el.innerHTML = binding.value.join(",");
                    return;
                }
                el.innerHTML = binding.value[0];
            } else {
                domTools.apply(el, false);
                el.innerHTML = "";
            }
        }
    })
    
    Vue.directive("remind",{
        update:function(el,binding,vnode,oldVnode){
            var expression=binding.expression;
            var errorText;
            if(vnode.context.$verify.$errors){
                errorText=_.get(vnode.context.$verify.$errors,expression);
            }
            if(errorText.length){
                domTools.apply(el, true);
                if (binding.modifiers.join) {
                    el.innerHTML = errorText.join(",");
                    return;
                }
                el.innerHTML = errorText[0];
            }else {
                domTools.apply(el, true);
                el.innerHTML = "";
            }
        }
    })
};

var install = function (Vue, options) {
    verifyInit(Vue, options);
    Directive(Vue, options);
};

module.exports = install;