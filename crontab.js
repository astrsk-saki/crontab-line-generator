//console.log("hello world!");
$(function(){
    $("#clipboard").on("click",function(){
        $('#crontab').select();
        document.execCommand('copy');
        toastr.info('クリップボードにコピーしました。');
    });

    var checkType = function(cls){
        // ごとの種類取得
        var types = [];
        $('.'+cls+'_type').map(function() {
            types.push(Number($(this).val()));
        });

        // ごとに当てはまらないもの削除
        $('.'+cls).map(function() {
            var del_types = [];
            if (!$(this).prop("checked")){

                var item_val = $(this).val();

                $.each(types,function(index,val){
                    if ( item_val % val == 0 ){
                        del_types.push(index);
                    }
                });
                $.each(del_types.reverse(),function(index,val){
                    types.splice(val, 1);
                });
            }
        });

        // 公倍数になっているもの削除
        var types_copy = types;
        var del_types = [];
        $.each(types,function(index,val){
            $.each(types_copy,function(index2,val2){
                if ( val < val2 &&  val2 % val==0 ){
                    del_types.push(index2);
                }
            });
        });

        $.each(del_types.reverse(),function(index,val){
            types.splice(val, 1);
        });

        // ボタン
        $('.'+cls+'_type').map(function() {
            var item_val = Number($(this).val());
            if ( $.inArray(item_val, types)>=0){
                $(this).prop("checked",true);
                $(this).parent().addClass('active');
            }else{
                $(this).prop("checked",false);
                $(this).parent().removeClass('active');
            }
        });

    }

    var getCronData = function(cls){
        checkType('min');
        checkType('hour');
        checkType('day');
        checkType('month');
        checkType('week');

        // ごとの種類取得
        var types = [];
        $('.'+cls+'_type').map(function() {
            if ($(this).prop("checked")){
                types.push(Number($(this).val()));
            }
        });

        // 組み立て
        var text = [];
        if ( $.inArray(1, types)>=0){
            text.push('*');
        }else{
            $.each(types,function(index,val){
                text.push('*/'+val);
            });
        }

        $('.'+cls).map(function() {
            if ( $(this).prop("checked") ){
                var item_val = $(this).val();
                if (types.length==0){
                    text.push(item_val);
                }else{
                    var is_find = false;
                    $.each(types,function(index,val){
                        if ( is_find == false && item_val % val == 0 ){
                            is_find = true;
                        }
                    });
                    if (!is_find){
                        text.push(item_val);
                    }
                }
            }
        });

        return text.join(',') + ' ';
    }

    var generateCrontab = function(){
        var text = "";
        
        text += getCronData('min');
        text += getCronData('hour');
        text += getCronData('day');
        text += getCronData('month');
        text += getCronData('week');

        text += $('#command').val();

        text += type.getCron();

        $('#crontab').val(text);
    }

    var setValue = function(cls, type, sw){

        $('.'+cls+'_type').map(function() {
            if ( $(this).val() == type ){
                $(this).prop("checked",sw);
                if (sw){
                    $(this).parent().addClass('active');
                }else{
                    $(this).parent().removeClass('active');
                }
            }
        });

        $('.'+cls).map(function() {
            if ( $(this).val() % type == 0 ){
                $(this).prop("checked",sw);
                if (sw){
                    $(this).parent().addClass('active');
                }else{
                    $(this).parent().removeClass('active');
                }
            }
        });
    }

    var type = {
        _stdout: 1,
        _stderr: 1,
        get stdout(){
            return this._stdout;
        },
        set stdout(num){
            this._stdout = num;
            $('.stdout_fieldset').prop('disabled', this._stdout==1);
        },
        get stderr(){
            return this._stderr;
        },
        set stderr(num){
            this._stderr = num;
            $('.stderr_fieldset').prop('disabled', this._stderr==1);
        },
        getCron : function(){
            var so = '/dev/null';
            if (this._stdout!=1 && $('#stdout').val()!=""){
                so = $('#stdout').val();
            }

            var se = '/dev/null';
            if (this._stderr!=1 && $('#stderr').val()!=""){
                se = $('#stderr').val();
            }

            if ( so == se ){
                return ' > '+so +' 2>&1';
            }
            return ' 1>'+so+' 2>'+se;
        }
    }


    $('.week_type').change(function() {
        setValue('week', $(this).val(), $(this).prop("checked"))
    });
    $('.month_type').change(function() {
        setValue('month', $(this).val(), $(this).prop("checked"))
    });
    $('.day_type').change(function() {
        setValue('day', $(this).val(), $(this).prop("checked"))
    });
    $('.hour_type').change(function() {
        setValue('hour', $(this).val(), $(this).prop("checked"))
    });
    $('.min_type').change(function() {
        setValue('min', $(this).val(), $(this).prop("checked"))
    });

    $('.stdout_type').change(function() {
        type.stdout = $(this).val();
    });
    $('.stderr_type').change(function() {
        type.stderr = $(this).val();
    });

    $('input').change(function() {
        generateCrontab();
    });

    setValue('week', 1, true);
    setValue('month', 1, true);
    setValue('day', 1, true);
    setValue('hour', 1, true);
    setValue('min', 1, true);

    type.stdout = 1;
    type.stderr = 1;

    generateCrontab();
});
