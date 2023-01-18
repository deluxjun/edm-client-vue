<template>
<!-- wrap_error -->
<div class="wrap_error"> 
		<!-- error_box -->
		<div class="error_box">
				<div class="error_con"> 
						<!-- content_error -->
						<div class="error_con_tit">
								<dl>
										<dt>{{ $t('errors.message')}}</dt>
										<dd class="start">{{ $t('errors.internal')}}</dd>
										<dd class="titl01"> {{ $t('errors.500msg1')}}<br>
										{{ $t('errors.500msg2')}}<br><br>
                    {{ $t('errors.question') }}
										</dd>
										<dd class="tel">{{ $t('errors.tel') }}</dd>
								</dl>
						</div>
						<!-- //content_error --> 						
				</div>
		</div>
		<!-- //error_box --> 
</div>
<!-- //wrap_error -->
</template>

<script>
export default {name: 'internal-error'}
</script>

<style>
.error_con{
  background: url(../../assets/img/icon_error.png) no-repeat center 51px;
}
.error_con_tit dd.tel{
  background:url(../../assets/img/icon_error_tell.png) no-repeat left bottom;
}
</style>

