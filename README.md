# verify

### install 
```
npm install verify-plugin
```

### use
```vue
<template>
	<div class="input-box clearFix">
		<div>
			<input v-model="age" v-verify="age" placeholder="age"/>
			<label class="fl" v-remind="age"></label>
		</div>
		<div>
			<input type="text" class="phoneIcon fl" placeholder="手机号码" v-model="regInfo.phone" v-verify="regInfo.phone">
			<label class="fl" v-remind="regInfo.phone"></label>
		</div>
		<button v-on:click="submit">提交</button>
	</div>
</template>

<script>
    import Vue from "vue";
    import verify from "verify-plugin";
    Vue.use(verify,{
        blur:true
    });
    export default {
        name: 'app',
        data () {
            return {
                age:"",
                regInfo: {
                    phone: ""
                }
            }
        },
        verify: {
            age:"required",
            regInfo: {
                phone: ["required","mobile"]
            }
        },
        methods:{
            submit: function () {
                console.log(this.$verify.check());
            }
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
	msgbox: Function, //自定义消息提示框
	force: Bool, //是否强制使用 msgBox
	scrollToEl: Bool, //是否滚动到校验的Dom节点
	field: { //针对输入框的单独配置
        msgbox: Bool, //输入框单独校验时是否使用 msgBox
        offsetTop: Number //滚动偏移量，配合 scrollToEl 使用
    },
    multiple: Bool //是否支持批量校验
}
```

### 自定义属性说明
[data-verify]
```js
{
    blur: Bool, //是否支持 blur 校验
    replace: {}, //v-model 校验键名替换项，比如 v-model="a[index].c" with replace:{index:1} => v-model="a[1].c"
    ignore: Bool, //是否忽略当前校验，用于动态操作校验逻辑，比如条件下的动态忽略
    error: [] //自定义错误提示，按定义规则顺序取值
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


##### v-remind 验证错误提示

##### v-remind修饰符说明
> .join 展示所有错误 用逗号隔开



##### 默认验证规则
- email 邮箱规则验证
- mobile 手机号码验证
- required 必填
- url 链接规则验证
- maxLength 最多maxLength个字符串(可自定义message)
- minLength 最少minLength个字符串(可自定义)
...


```vue 
<script>
verify: {
    username: [
        "required",
        {
            minLength:2,
            message: "姓名不得小于两位"
        },
        {
            maxLength:5,
            message: "姓名不得大于5位"
        }
    ],
    mobile:["required","mobile"],
    email:"email"
    url:"url"
    pwd: {
        minLength:6,
        message: "密码不得小于6位"
    }
},
</script>


```

### 行内校验规则
```js
    <input v-verify="phonenumber" v-model="phonenumber" data-verify="{error:['手机号不能为空','请正确输入手机号码']}"/>
    <input v-verify="'required|mobile'" v-model="phonenumber" data-verify="{error:['手机号不能为空','请正确输入手机号码']}"/>
```


### 自定义验证规则一 
```js
    import Vue from "vue";
    import verify from "verify-plugin";
    var myRules={
        max6:{
            test:function(val){
                if(val.length>6) {
                    return false
                }
                return true;
            },
            message:"最大为6位"
        }
        
    };
    Vue.use(verify,{
        rules:myRules
    });
    export default {
        name: 'app',
        data () {
            return {
                age:"",
                teacher:"",
                regInfo: {
                    phone: ""
                }
            }
        },
        verify: {
            age:"required",
            teacher:"max6",
            regInfo: {
                phone: ["required","mobile"]
            }
        },  
        methods:{
            submit: function () {
                console.log(this.$verify.check());
            }
        }
    }
```





### 自定义验证规则二


```js
    import Vue from "vue";
    import verify from "verify-plugin";
    
    export default {
        name: 'app',
        data () {
            return {
                age:"",
                teacher:"",
                regInfo: {
                    phone: ""
                }
            }
        },
        verify: {
            age:"required",
            teacher:[
                {
                 	test:function(val){
                    	if(val.length>6) {
                            return false
                        }
                        return true;
                    },
                    message:"最大为6位"  
                }
            ],
            regInfo: {
                phone: ["required","mobile"]
            }
        },  
        methods:{
            submit: function () {
                console.log(this.$verify.check());
            }
        }
    }
```