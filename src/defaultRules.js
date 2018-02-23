/*
 * 校验规则
 * @Author: liangzc 
 * @Date: 2017-07-20
 * @Last Modified by: liangzc
 * @Last Modified time: 2018-02-13 16:05:36
 */

/**
 * 身份证校验
 */
let idCard = {
  /**
   * 身份证验证
   */
  idCardValidate: function(idCard) {
    idCard = idCard ? idCard.replace(/ /g, '') : idCard; // 对身份证号码做处理。包括字符间有空格。
    /**
     * 验证15位数身份证号码中的生日是否是有效生日
     *
     * @param idCard15
     *            15位书身份证字符串
     * @return
     */
    let isValidityBrithBy15IdCard = function(idCard15) {
      let year = idCard15.substring(6, 8);
      let month = idCard15.substring(8, 10);
      let day = idCard15.substring(10, 12);
      let temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
      // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
      if (
        temp_date.getYear() !== parseFloat(year) ||
        temp_date.getMonth() !== parseFloat(month) - 1 ||
        temp_date.getDate() !== parseFloat(day)
      ) {
        return false;
      }
      return true;
    };
    /**
     * 验证18位数身份证号码中的生日是否是有效生日
     *
     * @param {String} idCard18
     *            18位书身份证字符串
     * @return {Boolean}
     */
    let isValidityBrithBy18IdCard = function(idCard18) {
      let year = idCard18.substring(6, 10);
      let month = idCard18.substring(10, 12);
      let day = idCard18.substring(12, 14);
      let temp_date = new Date(year, parseFloat(month) - 1, parseFloat(day));
      // 这里用getFullYear()获取年份，避免千年虫问题
      if (
        temp_date.getFullYear() !== parseFloat(year) ||
        temp_date.getMonth() !== parseFloat(month) - 1 ||
        temp_date.getDate() !== parseFloat(day)
      ) {
        return false;
      }
      return true;
    };
    /**
     * 判断身份证号码为18位时最后的验证位是否正确
     *
     * @param {Array} a_idCard
     *            身份证号码数组
     * @return {Boolean}
     */
    let isTrueValidateCodeBy18IdCard = function(a_idCard) {
      let Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1]; // 加权因子
      let ValideCode = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // 身份证验证位值.10代表X
      let sum = 0; // 声明加权求和变量
      if (a_idCard[17].toLowerCase() === 'x') {
        a_idCard[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
      }
      for (let i = 0; i < 17; i++) {
        sum += Wi[i] * a_idCard[i]; // 加权求和
      }
      valCodePosition = sum % 11; // 得到验证码所位置
      if (a_idCard[17] === ValideCode[valCodePosition]) {
        return true;
      }
      return false;
    };
    if (/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard)) {
      if (idCard.length === 15) {
        return isValidityBrithBy15IdCard(idCard); // 进行15位身份证的验证
      } else if (idCard.length === 18) {
        let a_idCard = idCard.split(''); // 得到身份证数组
        if (
          isValidityBrithBy18IdCard(idCard) &&
          isTrueValidateCodeBy18IdCard(a_idCard)
        ) {
          // 进行18位身份证的基本验证和第18位的验证
          return true;
        }
        return false;
      }
    } else {
      return false;
    }
  },
  /**
   * 通过身份证获取出生日期
   *
   * @param {String} idCard
   *            15/18位身份证号码
   * @return {Boolean}
   */
  birthDayByIdCard: function(idCard) {
    idCard = idCard ? idCard.replace(/ /g, '') : idCard; // 对身份证号码做处理。包括字符间有空格。
    if (!this.idCardValidate(idCard)) return null;
    let year, month, day;
    if (idCard.length === 15) {
      year = idCard.substring(6, 8);
      month = idCard.substring(8, 10);
      day = idCard.substring(10, 12);
    } else {
      year = idCard.substring(6, 10);
      month = idCard.substring(10, 12);
      day = idCard.substring(12, 14);
    }
    return year + '-' + month + '-' + day;
  },
  /**
   * 通过身份证判断是男是女
   *
   * @param {String} idCard
   *            15/18位身份证号码
   * @return {String} '0'-男,'1'-女
   */
  maleOrFemalByIdCard: function(idCard) {
    idCard = idCard ? idCard.replace(/ /g, '') : idCard; // 对身份证号码做处理。包括字符间有空格。
    if (!this.idCardValidate(idCard)) return null;
    if (idCard.length === 15) {
      if (idCard.substring(14, 15) % 2 === 0) {
        return '1';
      }
      return '0';
    } else if (idCard.length === 18) {
      if (idCard.substring(14, 17) % 2 === 0) {
        return '1';
      }
      return '0';
    }
    return null;
  }
};
let rules = {
  email: {
    test: /.+@.+\..+/,
    message: '邮箱格式错误'
  },
  mobile: {
    test: /^1[34578]\d{9}$/,
    message: '手机号码格式不正确'
  },
  required: {
    test: function(value) {
      return value !== null && value !== undefined && /\S+/.test(value);
    },
    required: true,
    message: '必填'
  },
  url: {
    test: /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[:?\d]*)\S*$/,
    message: 'URL 格式错误'
  },
  tel: {
    //验证固话
    test: /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/,
    message: '请正确输入固定电话'
  },
  fax: {
    //传真
    test: /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/,
    message: '请正确输入传真号码'
  },
  /**
   * 判断姓名是否合法
   * 1、姓名字段不能为空
   * 2、姓名字段中不允许含有数字\标点符号(“·”除外），且首位与末位不能为空格
   * 3、姓名字段中不允许含有汉字又同时含有字母
   * 4、姓名字段长度不小于2个字符
   */
  fullname: {
    test: function(value) {
      return value ?
        /^[\u2E80-\u9FFF]+[·|\s|\u2E80-\u9FFF]*[\u2E80-\u9FFF]+$/.test(
          value
        ) || /^[a-zA-Z]+[•|\s|a-zA-Z]*[a-zA-Z|•]+$/.test(value) :
        false;
    },
    message: '请正确输入姓名'
  },
  number: {
    //判断字符串是否为数字
    test: /^(\+|-)?\d+($|\.\d+$)/,
    message: '请输入纯数字'
  },
  integer: {
    //非负整数(正整数和零)
    test: /^[0-9]+[0-9]*]*$/,
    message: '请输入非负整数'
  },
  integerNum: {
    //非负浮点(正浮点数和零)
    test: /^(([0-9]*)|(([0]\.\d{1,}|[1-9][0-9]*\.\d{1,})))$/,
    message: '请输入非负浮点数'
  },
  positiveInt: {
    //正整数
    test: /^[1-9][0-9]*$/,
    message: '请输入正整数'
  },
  positiveNum: {
    //判断是否为正整数+正浮点数
    test: /^(([1-9][0-9]*)|(([0]\.\d{1,}|[1-9][0-9]*\.\d{1,})))$/,
    message: '请输入正整数或正浮点数'
  },
  address: {
    //是否是合法地址（必须包含汉字，不能连续5个相同字符，不少于16个字节）
    test: function(value) {
      function getBytesCount(value) {
        if (
          !value ||
          value === undefined ||
          value === '' ||
          value.length === 0
        ) {
          return 0;
        }
        return value.length + value.replace(/[\u0000-\u00ff]/g, '').length;
      }
      return (
        /[\u4E00-\u9FA5]/g.test(value) &&
        !/(\S+)\1{7}/gi.test(value) &&
        getBytesCount(value) >= 16
      );
    },
    message:
      '详细地址必须包含汉字，不能连续5个相同字符，最少8个汉字，长度不少于16个字节'
  },
  qq: {
    //是否是QQ号
    test: /[1-9]([0-9]{4,11})/,
    message: '请正确输入QQ号码'
  },
  wechat: {
    //是否是微信
    test: /^[a-zA-Z\d_]{5,}$/,
    message: '请正确输入微信号码'
  },
  password: {
    //是否符合密码规则校验，长度6-20位 数字+字母
    test: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/,
    message: '请正确输入密码，6-20位英文和数字'
  },
  height: {
    test: /^[1-9]\d{1,2}(\.\d{1,2})?$/,
    message: '请正确输入身高'
  },
  weight: {
    test: /^[1-9]\d{0,2}(\.\d{1,2})?$/,
    message: '请正确输入体重'
  },
  zipNo: {
    test: /^[1-9][0-9]{5}$/,
    message: '请正确输入邮编'
  },
  bankNo: {
    //校验银行卡号，16或19位纯数字
    test: /^[1-9][0-9]{15,18}$/,
    message: '请正确输入银行卡号'
  },
  idcard: {
    test: function(value) {
      return idCard.idCardValidate(value);
    },
    placeholder: '', //占位
    message: '请正确输入{0}身份证号码'
  },
  passport: {
    //外国护照
    test: /^[A-Za-z0-9]{3,20}$/,
    placeholder: '', //占位
    message: '{0}证件类型为外国护照，证件号码位数必须为3-20个字符'
  },
  passportCN: {
    //中国护照
    test: /^[A-Za-z0-9]{7,10}$/,
    placeholder: '', //占位
    message: '{0}证件类型为中国护照，证件号码位数必须为7-10个字符'
  },
  birthCertificate: {
    test: /^[a-zA-Z]{1}[0-9]{7,11}$/,
    placeholder: '', //占位
    message: '请正确输入{0}出生证'
  },
  HMMainlandPass: {
    //港澳居民来往内地通行证 - 字母开头且证件号码位数必须为11个字符
    test: /^[a-zA-Z][0-9]{10}$/,
    placeholder: '', //占位
    message: '请正确输入{0}港澳居民来往内地通行证'
  },
  TWMainlandPass: {
    //台湾居民来往大陆通行证 - 8-10个字符
    test: /^[a-zA-Z0-9]{8,10}$/,
    placeholder: '', //占位
    message: '请正确输入{0}台湾居民来往大陆通行证'
  },
  officersCertificate: {
    test: /^[a-zA-Z0-9]{10,18}$/,
    placeholder: '', //占位
    message: '{0}证件类型为军官证，证件号码必须为10-18个字符'
  },
  soldierCard: {
    test: /^[a-zA-Z0-9]{10,18}$/,
    placeholder: '', //占位
    message: '{0}证件类型为士兵证，证件号码必须为10-18个字符'
  },
  minLength: {
    //最小长度
    test: function(value, rule) {
      //rule 定义的规则的值
      return value && rule && value.length >= parseInt(rule);
    },
    message: '请输入一个长度最少为{0}位的字符'
  },
  maxLength: {
    //最大长度
    test: function(value, rule) {
      return value && rule && value.length <= parseInt(rule);
    },
    message: '请输入一个长度最大为{0}位的字符'
  },
  min: {
    //最小值
    test: function(value, rule) {
      return value && rule && Number(value) >= Number(rule || '0');
    },
    message: '请输入一个大于等于{0}的数字'
  },
  max: {
    //最大值
    test: function(value, rule) {
      return (
        value &&
        rule &&
        Number(value) <= Number(rule || Number.POSITIVE_INFINITY)
      );
    },
    message: '请输入一个小于等于{0}的数字'
  },
  base: {
    //基数整除
    test: function(value, rule) {
      return value && value % parseInt(rule || '1') === 0;
    },
    message: '请输入{0}的整数倍'
  }
};
module.exports = {
  rules: rules,
  idCard: idCard
};
