/*
 * @Author: focus 
 * @Date: 2017-06-22
 * @Last Modified by: liangzc
 * @Last Modified time: 2018-02-23 11:28:04
 */
import verify from './verify';

// //配置项
// options : {
//     blur: true, //是否支持失去焦点校验
//     msgbox: MintUI.Toast, //自定义消息提示框
//     force: false, //是否强制使用 msgBox
//     scrollToEl: true, //是否滚动到校验的Dom节点
//     field: { //针对输入框的单独配置
//         msgbox: true, //输入框单独校验时是否使用 msgBox
//         offsetTop: Number //滚动偏移量，配合 scrollToEl 使用
//     },
//     multiple: false //是否支持批量校验
// }

// //自定义属性
// data-verify: {
//     blur: blur, //是否支持 blur 校验
//     replace: {}, //v-model 校验键名替换项，比如 v-model="a[index].c" with replace:{index:1} => v-model="a[1].c"
//     ignore: false, //是否忽略当前校验，用于动态操作校验逻辑，比如条件下的动态忽略
//     error: [] //自定义错误提示
// }

// //指令字面量属性
// [v-verify]: {
//     rule: 'require', //校验规则,仅支持字符串
//     blur: blur, //是否支持 blur 校验
//     replace: {}, //v-model 校验键名替换项，比如 v-model="a[index].c" with replace:{index:1} => v-model="a[1].c"
//     error: [] //自定义错误提示
// }
// [v-remind]: {
//     field: 'code', //校验提示字段，仅支持字符串
//     blur: blur, //是否支持 blur 校验
//     replace: {}, //v-model 校验键名替换项，比如 v-model="a[index].c" with replace:{index:1} => v-model="a[1].c"
//     error: [] //自定义错误提示
// }

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(verify);
}

export default verify;
