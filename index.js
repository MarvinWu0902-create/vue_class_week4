import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.1/vue.esm-browser.min.js';
import axios from 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.5/esm/axios.js';


let productModal = '';
let delProductModal = '';

const apiPath = 'marvinapipath';

const app = createApp({
    data() {
        return {
            pageShow: false,
            productData: [],
            paginationData: [],
            tempProductData: {},
            modalStatus: '',
        }
    },
    methods: {
        getProduct() {  ///這個之後傳進子組件
            return axios.get(`https://ec-course-api.hexschool.io/v2/api/${apiPath}/admin/products`)
                .then((res) => {
                    const { products, pagination } = res.data
                    this.productData = products;
                    this.paginationData = pagination
                    this.pageShow = true;
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        checkHandler() {

            return axios.post('https://ec-course-api.hexschool.io/v2/api/user/check', null)
                .then((res) => {
                    if (!res.data.success) {

                        window.location = 'login.html';

                    } else {

                        return this.getProduct()
                    }
                })
                .catch((err) => {

                    alert(err.response.data.message);
                    window.location = 'login.html';
                })
        },
        signoutHandler() {
            document.cookie = "hexVueToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            this.checkHandler();
        },
        getProductTemp(product) {
            this.productTemp = product;
        },

        setHeaderToken() {
            const token = document.cookie.split("; ")
                .find((row) => row.startsWith("hexVueToken="))
                ?.split("=")[1];
            axios.defaults.headers.common["Authorization"] = token;
        },

        showModal(mode, data) {
            this.modalStatus = mode;
            if (this.modalStatus === 'delete') {
                delProductModal.show();
                this.tempProductData = data;
            }
            if (this.modalStatus === 'add') {
                productModal.show();
            }
            if (this.modalStatus === 'edit') {
                productModal.show();
                this.modalProductData = { ...data }; //淺拷貝給modalProductData(新建一個物件並指向)，防止更動modalProductData影響productData
            }



        },
        closeModal() {
            if (this.modalStatus === 'delete') {
                delProductModal.hide();
                this.tempProductData = {};
            }
            if (this.modalStatus === 'add' || this.modalStatus === 'edit') {
                productModal.hide();
                // this.modalProductData = {};
            }
            this.modalStatus = '';

        }
    },
    mounted() {
        this.setHeaderToken();
        this.checkHandler();
    }
});
// Modal 子組件

// 全域註冊一波
app.component('productModal', {
    template: '#productModal',
    props: ['getProduct', 'modalStatus'],
    data() {
        return {
            modalProductData: {
                imagesUrl: []
            },
            insertImageMode: 'main',
        }
    },
    methods: {
        addProduct() {

            return axios.post(`https://ec-course-api.hexschool.io/v2/api/${apiPath}/admin/product`, {
                data: this.modalProductData
            })
                .then((res) => {
                    this.closeModal();
                    alert(res.data.message);
                    return this.getProduct()
                })
                .catch((err) => {

                    alert(err.data.message);
                })
        },
        editProduct(id) {
            return axios.put(`https://ec-course-api.hexschool.io/v2/api/${apiPath}/admin/product/${id}`,
                {
                    data: this.modalProductData
                }
            )
                .then((res) => {
                    this.closeModal();
                    alert(res.data.message);
                    return this.getProduct()
                })
                .catch((err) => {
                    alert(res.data.message);
                })
        },
        addImage() {
            this.modalProductData.imagesUrl.push('');
        },
        deleteImage() {
            this.modalProductData.imagesUrl.splice(this.modalProductData.imagesUrl.length - 1, 1);
        },
        closeModal() { ///emit
            this.modalProductData = {};
            this.$emit('close-modal');
        },
        sendProductData() {
            if (this.modalStatus === 'add') {
                return this.addProduct()
            }
            if (this.modalStatus === 'edit') {
                return this.editProduct(this.modalProductData.id)
            }
        }
    },
    mounted() {
        productModal = new bootstrap.Modal(document.getElementById('productModal'));
    }
});

app.component('deleteModal', {
    template: '#deleteModal',
    props: ['getProduct', 'tempData'],
    methods: {
        deleteProduct() {

            const id = this.tempData.id;

            return axios.delete(`https://ec-course-api.hexschool.io/v2/api/${apiPath}/admin/product/${id}`)
                .then((res) => {
                    this.closeModal();
                    alert(res.data.message);
                    return this.getProduct()
                })
                .catch((err) => {
                    console.log(err);
                    alert(err.data.message);
                })
        },
        closeModal() {
            this.$emit('close-modal')
        }
    },
    mounted() {
        delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'));
    }
})

app.component('paginationBar', {
    template: '#pagination',
    props: ['paginationData'],
})



app.mount('#app');


