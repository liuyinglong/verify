# verify

### install 
```
npm install vue-verify-plugin
```

### use
```vue
<template>
    <div id="app">
        <div>
            <input-box>
                <input type="text" v-model.trim="username" v-verify="username" placeholder="姓名"/>
                <label v-verified="verifyError.username"></label>
            </input-box>
            <div>
                <input type="password" v-model="pwd" v-verify="pwd" placeholder="密码"/>
                <label v-verified="verifyError.pwd"></label>
            </div>
            <div>
                <input type="text" v-model="email" v-verify="email" placeholder="邮箱"/>
                <label v-verified="verifyError.email"></label>
            </div>
            <div>
                <button v-on:click="submit">提交</button>
            </div>
            <div>{{$verify.$errorArray}}</div>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import verify from "../verify/src/verify";
    import inputBox from "./inputBox.vue"
    Vue.use(verify);
    export default {
        name: 'app',
        data () {
            return {
                username: "",
                pwd: "",
                email: "",
                a: {
                    b: {
                        c: "123"
                    }
                }
            }
        },
        verify: {
            username: [
                "required",
                {
                    minLength:2,
                    message: "姓名不得小于两位"
                },
                {
                    maxLength:5
                }
                ],
            pwd: {
                minLength:6,
                message: "密码不得小于6位"
            }
        },
        computed: {
            verifyError: function () {
                return this.$verify.$errors;
            }
        },
        methods: {
            submit: function () {
                console.log(this.$verify.check());
            }
        },
        components: {
            inputBox
        }
    }
</script>
```
 
### 验证错误信息说明
验证之后的错误存储在 vm.$verify.$errors 中，可自行打印出
vm.$verify.$errorArray 存储上一次验证的错误


### 配置说明
配置传入一个对象
```js
{
    rules:{}//自定义验证方法
    blur:Bool //失去焦点时 是否开启验证
}
```


### 指令说明

#### v-verify
在表单控件元素上创建数据的验证规则，他会自动匹配要验证的值以及验证的规则。

##### v-verify 修饰符说明
该指令最后一个修饰符为自定义分组  
```js
//自定义teacher分组
v-verify.teacher
//自定义student分组
v-verify.student

//验证时可分开进行验证  

//验证student 分组
this.$verify.check("student")
//验证teacher 分组
this.$verify.check("teacher")
//验证所有
this.$verify.check();
```

##### v-verify指令也可使用 arg参数进行验证分组 
**如果同时使用修饰符和arg分组 则arg会覆盖修饰符分组**

```js
v-verify:student
//验证student 分组
this.$verify.check("student")
```

#### v-verified
v-verified 错误展示，当有错误时会展示，没有错误时会加上style:none,默认会展示该数据所有错误的第一条  
该指令为语法糖(见示例)

```html
<input v-model="username" v-verify="username">

<label v-show="$verify.$errors.username && $verify.$errors.username.length" v-text="$verify.$errors.username[0]"></label>
<!--等价于-->
<label v-verified="$verify.$errors.username"></label>
<!--展示所有错误-->
<label v-verified.join="$verify.$errors.username">
```

##### 修饰符说明
> .join 展示所有错误 用逗号隔开

##### 默认验证规则
- email 邮箱规则验证
- mobile 手机号码验证
- required 必填
- url 链接规则验证
- maxLength 最多maxLength个字符串(可自定义message)
- minLength 最少minLength个字符串(可自定义)

> 实例
```
verify: {
    username: [
        "required",
        {
            minLength:2,
            message: "姓名不得小于两位"
        },
        {
            maxLength:5
        }
    ],
    mobile:"required",
    email:"email"
    pwd: {
        minLength:6,
        message: "密码不得小于6位"
    }
},
```

##### 新增默认规则
```js
var myRules={
    phone:{
        test:/^1[34578]\d{9}$/,
        message:"电话号码格式不正确"
    },
    max6:{
        test:function(val){
            if(val.length>6) {
                return false
            }
            return true;
        },
        message:"最大为6位"
    }
    
}
import Vue from "vue";
import verify from "vue-verify-plugin";
Vue.use(verify,{
    rules:myRules
});
```