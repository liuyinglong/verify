module.exports = (function() {
  /**
   * 解析JSON
   * @param {*} json
   */
  function parseJson(json) {
    try {
      return json instanceof Object ? json : eval('(' + json + ')');
    } catch (e) {
      console.error(e.message, e);
      return null;
    }
  }

  /**
   * check value type
   * @param  {String}  type
   * @param  {*}  val
   * @return {Boolean}
   */
  function is(type, val) {
    return Object.prototype.toString.call(val) === '[object ' + type + ']';
  }

  /**
   * 自定义foreach，支持 return false
   * @param {Array} arr
   * @param {Function} func
   */
  function forEach(arr, func) {
    if (!func) return;
    for (let i = 0; i < arr.length; i++) {
      let ret = func(arr[i], i); //回调函数
      if (typeof ret !== 'undefined' && (ret === null || ret === false)) break;
    }
  }

  /**
   * 是否是通过 Vue-verify 配置
   * @param {String} expression binding.expression
   */
  function isVerifyConfig(expression) {
    return (
      expression.indexOf('|') === -1 &&
      expression.indexOf('\'') === -1 &&
      is('String', expression)
    );
  }

  /**
   * 获取 Field配置项
   * @param {Object} options 配置项
   * @param {String} field 校验字段
   */
  function fieldOption(options, field) {
    if (field) {
      options[window.location.hash] = {
        field: field
      };
    } else {
      return (options[window.location.hash] || {}).field || {};
    }
  }

  /**
   * 处理自定义属性
   * @param {*} vm
   * @param {String} prototype 属性名
   * @param {*} protoval 属性值
   * @param {Boolean} merge 是否合并现有的
   */
  function defineDataPro(vm, prototype, protoval, merge) {
    let value = vm.$verify.protoQueue[prototype];
    if (value && merge) {
      if (Array.isArray(value)) {
        value.push(protoval);
      } else {
        value = Object.assign({}, value, protoval);
      }
    } else {
      value = protoval;
    }
    vm.$verify.protoQueue[prototype] = value;
  }

  /**
   * 处理自定义错误(remind/verified > el )
   * @param {Vue} vm
   * @param {Element} el 校验节点
   * @param {String} field 校验字段
   * @param {Object} attr 自定义属性
   */
  function defineErrors(vm, el, field, attr) {
    attr = attr || parseJson(el.getAttribute('data-verify'));
    let errors = attr ? attr.error : null;
    if (!errors) {
      errors = el.getAttribute('data-verify_errors');
      if (!errors || errors === '') return;
      errors = parseJson(errors);
    }
    defineDataPro(
      vm,
      'errors',
      { [field]: errors && Array.isArray(errors) ? errors : [] },
      true
    );
  }

  /**
   * 提取自定义属性，参考 plugins/verify-plugin/index.js
   * @param {Vue} vm
   * @param {Element} el
   * @param {Object} binding v-[*] 绑定信息
   * @param {Function} callback 回调函数
   */
  function defineAttr(vm, el, binding, callback) {
    let verifyAttr = parseJson(el.getAttribute('data-verify')) || {};
    if (!verifyAttr.hasOwnProperty('blur')) {
      verifyAttr.blur = true;
    }
    if (verifyAttr.replace) {
      for (let attr in verifyAttr.replace) {
        binding.field = binding.field.replace(
          new RegExp(attr, 'gm'),
          verifyAttr.replace[attr]
        );
      }
    }
    defineErrors(vm, el, binding.field, verifyAttr);
    if (binding.name === 'remind') {
      //有定义 v-remind，缓存定义 v-remind 的字段，错误提示使用 remind 提示代替默认提示
      defineDataPro(vm, 'remind', { [binding.field]: el }, true);
    } else if (binding.name === 'verify') {
      //定义了 v-verify 的字段，提取自定义属性中的 blur 字段，用于失去焦点校验
      defineDataPro(
        vm,
        'blur',
        {
          [binding.field]:
            verifyAttr.blur === true || verifyAttr.blur === 'true'
        },
        true
      );
    }
    //存储原始节点
    defineDataPro(vm, 'original', { [binding.field]: el }, true);

    callback && callback(binding.field);
  }

  /**
   * 批量展示消息
   *
   * @param {Vue} vm
   * @param {Object} options 配置项
   */
  function batchMsg(vm, options) {
    //暂时屏蔽，批量校验仅支持行内错误提示
    if (
      options &&
      options.multiple &&
      options.msgbox &&
      vm.$verify.$errorArray &&
      vm.$verify.$errorArray.length > 0
    ) {
      options.msgbox(vm.$verify.$errorArray.join(','));
    }
  }

  /**
   * 获取当前校验的节点
   * @param {Vue} vm
   * @param {String} field
   */
  function getVerifyEl(vm, field) {
    let _original = vm.$verify.protoQueue.original || {},
      _el;
    for (let key in _original) {
      if (key === field) {
        _el = _original[key];
        break;
      }
    }
    return _el;
  }

  /**
   * 滚动到当前校验的节点
   * @param {Vue} vm
   * @param {String} field
   * @param {Number} offsetTop 偏移量
   */
  function scrollToVerifyEl(vm, field, offsetTop) {
    let el = getVerifyEl(vm, field);
    //不在可见区域内时，滚动
    if (
      el &&
      !(
        el.offsetTop + el.offsetHeight / 3 >= window.pageYOffset &&
        el.offsetTop + el.offsetHeight / 3 <
          window.pageYOffset + window.outerHeight
      )
    ) {
      scrollTo(0, el.offsetTop + (offsetTop || 0));
    }
  }

  /**
   * 获取expression
   * @param {Vue} vm
   * @param {String} field 校验节点
   */
  function getExpression(vm, field) {
    let _verifyQueue = vm.$verify.verifyQueue,
      _expression,
      _break;
    for (let key in _verifyQueue) {
      let queue = _verifyQueue[key] || [];
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].field === field) {
          _expression = item.expression;
          _break = true;
          break;
        }
      }
      if (_break) {
        break;
      }
    }
    return _expression;
  }

  /**
   * 通过v-model自定义错误提示
   * @param {Vue} vm
   * @param {String} field 校验字段
   * @param {Object/Array} rule 符合定义的规则列表
   */
  function replaceError(vm, field, rule, index) {
    if (rule) {
      let errors =
        (vm.$verify.protoQueue.errors ?
          vm.$verify.protoQueue.errors[field] :
          []) || [];
      if (Array.isArray(rule)) {
        rule = rule.map((re, i) => {
          re.message = errors[i || 0] || re.message;
          return re;
        });
      } else {
        rule.message = errors[index || 0] || rule.message;
      }
    }
    return rule;
  }

  /**
   * 通过校验规则转换自定义错误提示
   * @param {Vue} vm
   * @param {String} field model字段
   * @param {String} expression 校验规则
   */
  function convertCustomError(vm, field, expression) {
    let defaultRe = (vm.$options.verify || {})[expression];
    if (!defaultRe) return null;
    let verifyExpression = Array.isArray(defaultRe) ? [] : {};
    verifyExpression = replaceError(
      vm,
      field,
      Object.assign(verifyExpression, verifyExpression, defaultRe)
    );
    return verifyExpression;
  }

  /**
   * 是否含有忽略标识（此标识用来实时忽略校验）
   * @param {*} vm
   * @param {String} field model字段
   */
  function ignore(vm, field) {
    let original = (vm.$verify.protoQueue.original || {})[field];
    if (original && original.hasAttribute('data-verify')) {
      let verifyAttr = parseJson(original.getAttribute('data-verify'));
      if (
        verifyAttr &&
        (verifyAttr.ignore === true || verifyAttr.ignore === 'true')
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * 是否需要MsgBox提示
   * @param {*} vm
   * @param {*} options
   */
  function isMsgBox(vm, options, field, validOnly) {
    return (
      options.force === true ||
      !options.multiple &&
        !validOnly &&
        fieldOption(options).msgbox !== false &&
        options.msgbox !== false &&
        !(
          vm.$verify.protoQueue.remind &&
          vm.$verify.protoQueue.remind.hasOwnProperty(field)
        )
    );
  }

  /**
   * 是否支持 Blur 校验
   * @param {Vue} vm
   * @param {String} field v-model 绑定的字段
   */
  function isSupportBlur(vm, field) {
    return (
      vm.$verify.protoQueue.blur &&
      vm.$verify.protoQueue.blur[field] === true &&
      !ignore(vm, field)
    );
  }

  return {
    isVerifyConfig: isVerifyConfig, //是否是通过 Vue-verify 配置(是否为组合校验，比如 'required|email')
    fieldOption: fieldOption, //获取 Field配置项
    defineErrors: defineErrors, //处理自定义错误(remind/verified > el )
    defineAttr: defineAttr, //提取自定义属性
    replaceError: replaceError, //通过v-model自定义错误提示
    batchMsg: batchMsg, //批量提示错误
    scrollToVerifyEl: scrollToVerifyEl, //滚动到当前校验的节点
    getExpression: getExpression, //获取field对应的校验规则字符串
    convertCustomError: convertCustomError, //通过校验规则转换自定义错误提示
    isMsgBox: isMsgBox, //是否需要MsgBox提示
    ignore: ignore, //是否包含有忽略标识
    isSupportBlur: isSupportBlur, //是否支持 blur 校验
    is: is, //数据类型判断
    parseJson: parseJson, //解析JSON
    forEach: forEach //自定义循环函数，支持 return false
  };
})();
