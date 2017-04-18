# verify

### install 
```js
npm install vue-verify-plugin
```

### use
- html
```html
<div>
    <div>
        <input type="text" placeholder="姓名" v-verify.grow1="username" v-model="username"/>
        <label v-verified="verifyError.username"></label>
    </div>
    <div>
        <input type="password" placeholder="密码" v-verify.grow1="pwd" v-model="pwd"/>
        <label v-verified="verifyError.pwd"></label>
    </div>
    <button v-on:click="submit">确认</button>
 </div>
```
- js
```js
import Vue from "vue";
import verify from "vue-verify-plugin";
Vue.use(verify);

export default{
    data:function(){
        return {
            username:"",
            pwd:""
        }
    },
    methods:{
        submit:function(){
            if(this.$verify.check()){
                //通过验证    
            }
        }
    },
    verify:{
        username:[
            "required",
            {
                test:function(val){
                    if(val.length<2){
                        return false;
                    }
                    return true;
                },
                message:"姓名不得小于2位"
            }
        ]，
        pwd:"required"
    }，
    computed:{
        verifyError:function(){
            return this.$verify.$errors;
        }
    }
}
```  

### 指令说明

#### v-verify
v-erify 在表单控件元素上创建数据的验证规则，他会自动匹配要验证的值以及验证的规则。

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

##### 自定义验证规则

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