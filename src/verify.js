/*
 * 校验核心js
 * @Author: focus 
 * @Date: 2017-04-14
 * @Last Modified by: liangzc
 * @Last Modified time: 2018-02-13 17:01:44
 */
    this.verifyQueue = {}; //验证队列
let _ = require('lodash/object'),
  domTools = require('./domTools'),
  helper = require('./helper'),
  { rules, idCard } = require('./defaultRules'),
  Vue,
  _options,
  _msgInstance;

let Verify = function(VueComponent) {
  this.vm = VueComponent;
  this.verifyQueue = {}; //验证队列
  this.protoQueue = {};
  Vue.util.defineReactive(this, '$errors', {});
};

let validate = function(field, rule, validOnly) {
  let vm = this; //Vue组件对象
  let value = _.get(vm, field);
  if (!vm.$verify.$errorArray) vm.$verify.$errorArray = [];
  if (!_options.multiple && vm.$verify.$errorArray.length > 0) return false; //单次校验，替代批量校验

  //如果为验证规则为数组则进行遍历
  if (Array.isArray(rule)) {
    return (
      rule
        .map(function(item) {
          return validate.call(vm, field, item, validOnly);
        })
        .indexOf(false) === -1
    );
  }

  // 为字符串时调用默认规则
  if (helper.is('String', rule)) {
    let _rule = rule.split('|');
    if (_rule.length > 1) {
      return (
        _rule
          .map((item, index) => {
            return validate.call(
              vm,
              field,
              helper.replaceError(
                vm,
                field,
                _.get(vm.$options.verify, item),
                index
              ),
              validOnly
            );
          })
          .indexOf(false) === -1
      );
    }
    rule = helper.replaceError(vm, field, rules[rule]);
  }

  // //如果验证规则不存在 结束
  if (
    !(
      rule &&
      (rule.test ||
        rule.maxLength ||
        rule.minLength ||
        rule.max ||
        rule.min ||
        rule.base)
    )
  ) {
    console.warn('rule of ' + field + ' not define');
    return false;
  }

  let valid = true;
  if (rule && rule.test) {
    //验证数据
    let defRule = rules[rule.test] || {};
    if (
      rule.required ||
      defRule.required ||
      rule.required !== true && rules.required.test(value)
    ) {
      //不是非空校验
      let test = defRule.test;
      valid = helper.is('Function', rule.test) ?
        rule.test.call(this, value) :
        helper.is('String', rule.test) ?
          helper.is('Function', test) ?
            test.call(this, value) :
            test.test(value) :
          rule.test.test(value);
    }
  }

  //校验特殊规则 minLength、maxLength、min、max、base
  if (
    rule &&
    (rule.maxLength || rule.minLength || rule.max || rule.min || rule.base)
  ) {
    let _dRule, _ruleValue;
    for (let key in rule) {
      _dRule = rules[key];
      if (_dRule) {
        _ruleValue = rule[key];
        break;
      }
    }
    if (_dRule) {
      valid = _dRule.test(value, _ruleValue);
    }
    rule.message =
      rule.message ||
      _dRule.message.replace(new RegExp('\\{0\\}', 'g'), _ruleValue || '');
  }

  //错误对象
  let $error = _.get(vm.$verify.$errors, field);
  //验证未通过
  if (!valid) {
    if (_options.allCheck === true && _options.scrollToEl === true) {
      //默认滚动到校验的节点，仅限于全部校验时
      helper.scrollToVerifyEl(
        vm,
        field,
        helper.fieldOption(_options).offsetTop || 0
      );
    }
    //处理 placeholder 占位符，比如 '{0}不能为空'
    rule.message = rule.message ?
      rule.message.replace(new RegExp('\\{0\\}', 'g'), rule.placeholder || '') :
      rule.message;
    if (helper.isMsgBox(vm, _options, field, validOnly)) {
      if (_msgInstance && _msgInstance.close) {
        _msgInstance.close();
      }
      _msgInstance = _options.msgbox(rule.message);
    }
    if (!_options.force) {
      $error.push(rule.message);
    }
    vm.$verify.$errorArray.push(rule.message);
  }
  return valid;
};

let init = function() {
  this.$options.verify = this.$options.verify || {};
  this.$verify = new Verify(this); //添加vm实例验证属性
  this.$verify.idCard = idCard; //对外暴露身份证校验对象
  this.$verify.rules = rules;
  _options.force = false; //重置配置项
  this.$nextTick(() => {
    Object.assign(this.$options.verify, rules, this.$options.verify);
  });
};

let verifyInit = function(_Vue, options) {
  Vue = _Vue;
  if (options && options.rules) {
    Object.assign(rules, rules, options.rules);
  }
  Vue.mixin({
    created: init
  });
};

//自定义指令
let Directive = function(Vue, options) {
  Vue.directive('verify', {
    bind: function(el, binding, vnode, oldVnode) {
      let vm = vnode.context; //当前组件实例
      let expression = binding.expression.replace(new RegExp('\'', 'gm'), ''); //处理字符串形式的校验规则，比如 "'required|email'"
      if (expression === null || expression === '' || expression.length === 0)
        return;
      //提取 field
      if (vnode.data.model) {
        binding.field = vnode.data.model.expression;
      } else {
        helper.forEach(vnode.data.directives, item => {
          if (item.name === 'model') {
            binding.field = item.expression;
            return false;
          }
        });
      }

      //自定义属性，参考 plugins/verify-plugin/index.js
      helper.defineAttr(vm, el, binding);

      //兼容封装组件
      el = domTools.findDom(el, ['input', 'select', 'textarea']); //获取真实Element，处理封装控件

      //得到焦点 移除错误
      el.addEventListener('focus', function() {
        _.set(vm.$verify.$errors, binding.field, []);
      });

      //失去焦点 进行验证
      if (options && options.blur) {
        el.addEventListener('blur', function() {
          if (helper.isSupportBlur(vm, binding.field)) {
            _options.force = false;
            _options.allCheck = false; //取消全部校验标识
            vm.$verify.$errorArray = [];
            validate.call(
              vm,
              binding.field,
              helper.convertCustomError(vm, binding.field, expression) ||
                expression
            );
          }
        });
      }

      //添加到验证队列
      let group;
      if (binding.rawName.split('.').length > 1) {
        group = binding.rawName.split('.').pop();
      } else if (binding.arg) {
        //如果arg存在
        //v-verify:arg
        group = binding.arg;
      } else {
        group = '';
      }
      if (!vm.$verify.verifyQueue[group]) {
        vm.$verify.verifyQueue[group] = [];
      }
      vm.$verify.verifyQueue[group].push({
        el: el,
        field: binding.field,
        expression: expression
      });

      /**
       *
      //添加数据监听绑定 getter setter
      Vue.util.defineReactive(vm.$verify.$errors, expression, []);

      //错误默认值为空
      _.set(vm.$verify.$errors, expression, []);
*/
      let tempExpression = expression.split('.');
      let tempErrors = vm.$verify.$errors;
      // debugger;
      for (let i = 0; i < tempExpression.length - 1; i++) {
        tempErrors = tempErrors[tempExpression[i]];
      }
      let key = tempExpression[tempExpression.length - 1];

      //添加数据监听绑定 getter setter
      let isVerConfig =
        helper.isVerifyConfig(binding.expression) && helper.isVerifyConfig(key);
      Vue.util.defineReactive(
        tempErrors,
        isVerConfig ? key : binding.field,
        []
      );

      //错误默认值为空
      _.set(vm.$verify.$errors, binding.field, []);
      vm.$verify.$errorArray = [];

      //监听错误 移除对应的Class
      //获取配置的样式表
      let errorClass = el.getAttribute('verify-class') || 'verify-error';
      errorClass &&
        expression.split('|').map(item => {
          vm.$watch('$verify.$errors.' + item, function(val) {
            if (val.length) {
              domTools.addClass(el, errorClass);
            } else {
              domTools.removeClass(el, errorClass);
            }
          });
          return item;
        });
    }
  });

  Vue.directive('remind', {
    bind: function(el, binding, vnode, oldVnode) {
      //缓存使用 remind 提示的字段，遇到此字段时 remind 提示优先
      binding.field = binding.expression.replace(new RegExp('\'', 'gm'), '');
      helper.defineAttr(vnode.context, el, binding);
    },
    update: function(el, binding, vnode, oldVnode) {
      let attrs = vnode.data.attrs;
      if (attrs && attrs.hasOwnProperty('data-verify')) {
        let verifyAttr = helper.parseJson(attrs['data-verify']);
        if (verifyAttr.replace) {
          binding.field = binding.expression.replace(new RegExp('\'', 'gm'), '');
          for (let attr in verifyAttr.replace) {
            binding.field = binding.field.replace(
              new RegExp(attr, 'gm'),
              verifyAttr.replace[attr]
            );
          }
        }
      }
      let errors = vnode.context.$verify.$errors,
        errorText;
      if (errors) {
        errorText = _.get(errors, binding.field || binding.expression);
      }
      if (errorText && errorText.length) {
        domTools.apply(el, true);
        if (binding.modifiers.join) {
          el.innerHTML = errorText.join(',');
          return;
        }
        el.innerHTML = errorText[0];
      } else {
        domTools.apply(el, true);
        el.innerHTML = '';
      }
    }
  });
};

/**
 * 接收自定义配置，优先级>全局配置
 */
Verify.prototype.config = function(options) {
  this.vm.$nextTick(() => {
    Object.assign(_options, _options, options || {});
    _options.scrollToEl =
      _options.scrollToEl !== undefined ? _options.scrollToEl : true;
    if (_options.field) {
      helper.fieldOption(_options, _options.field);
      delete _options.field;
    }
  });
};

/**
 * 手动校验某个字段值
 * @param {String} field vue 绑定字段名
 * @param {Array|Object} rule 校验规则（选填时，校验规则需和v-Mode保持一致）
 * @param {Boolean} validOnly 仅校验，不提示
 */
Verify.prototype.validate = function(field, rule, validOnly) {
  if (typeof rule === 'boolean') {
    validOnly = rule;
    rule = null;
  }
  this.vm.$verify.$errorArray = [];
  _.set(this.vm.$verify.$errors, field, []);
  return validate.call(
    this.vm,
    field,
    rule ||
      helper.convertCustomError(this.vm, field, field) ||
      helper.getExpression(this.vm, field),
    validOnly
  );
};

/**
 * 校验所有
 * @param {group} 分组校验(v-verify.group)
 * @param {validOnly} 仅校验，不提示
 */
Verify.prototype.check = function(group, validOnly) {
  _options.allCheck = true; //全部校验标识
  if (group && helper.is('Object', group)) {
    let _checkOpt = group;
    group = _checkOpt.group;
    validOnly = _checkOpt.validOnly;
    _options.force = _checkOpt.force;
  }
  if (typeof group === 'boolean') {
    validOnly = group;
    group = null;
  }
  let self = this;
  let vm = this.vm; //Vue实例
  let verifyQueue;
  if (group) {
    if (!vm.$verify.verifyQueue[group]) {
      console.warn(group + ' not found in the component');
    }
  }

  //分组处理
  if (group && vm.$verify.verifyQueue[group]) {
    verifyQueue = vm.$verify.verifyQueue[group];
  } else {
    verifyQueue = [];
    for (let k in vm.$verify.verifyQueue) {
      verifyQueue = verifyQueue.concat(verifyQueue, vm.$verify.verifyQueue[k]);
    }
  }

  //错误数组,按照本次验证的顺序推入数组
  vm.$verify.$errorArray = [];

  //遍历验证队列进行验证
  let _result =
    verifyQueue
      .map(function(item) {
        if (helper.ignore(vm, item.field) || !domTools.inDoc(item.el)) {
          return true;
        }
        _.set(vm.$verify.$errors, item.field, []);
        return validate.call(
          self.vm,
          item.field,
          helper.convertCustomError(vm, item.field, item.expression) ||
            item.expression,
          validOnly
        );
      })
      .indexOf(false) === -1;
  helper.batchMsg(vm, _options);
  return _result;
};

/**
 * 获取错误提示
 * @param {String} expression 错误键名（为空时返回全部错误提示）
 * @return {String}
 */
Verify.prototype.errors = function(expression) {
  if (!expression) {
    return this.vm.$verify.$errors;
  }
  let errorText = this.vm.$verify.$errors ?
    _.get(this.vm.$verify.$errors, expression) :
    null;
  if (errorText && Array.isArray(errorText)) {
    return errorText[0];
  }
  return null;
};

let install = function(Vue, options = {}) {
  _options = options;
  _options.multiple = options.hasOwnProperty('multiple') ?
    options.multiple :
    false; //是否批量，默认为 false
  _options.scrollToEl =
    _options.scrollToEl !== undefined ? _options.scrollToEl : true; //是否滚动到校验的节点
  verifyInit(Vue, options);
  Directive(Vue, options);
};

module.exports = install;
