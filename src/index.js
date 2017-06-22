/**
 * Created by focus on 2017/6/22.
 */
import verify from "./verify";

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(verify);
}

export default verify;